const { z } = require('zod')
const { query, pool } = require('../config/db')

const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  title: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  education: z.string().max(300).optional(),
  school: z.string().max(300).optional(),
  fieldOfStudy: z.string().max(200).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  skills: z.array(z.string().max(100)).max(30).optional(),
  educationHistory: z
    .array(
      z.object({
        title: z.string().max(200).optional(),
        school: z.string().max(300).optional(),
        year: z.string().max(20).optional(),
      }),
    )
    .max(10)
    .optional(),
})

const addAchievementSchema = z.object({
  title: z.string().min(1, 'Titre requis.').max(200),
  description: z.string().max(2000).optional(),
  image_url: z.string().max(2000).optional(),
  project_url: z.string().max(2000).optional(),
})

function computeCompletionScore(row, achievementCount) {
  let score = 20
  if (row.bio) score += 20
  if (row.education || row.school) score += 20
  if (row.skills && row.skills.length > 0) score += 20
  if (achievementCount > 0) score += 20
  return Math.min(score, 100)
}

async function getMe(userId) {
  const profileResult = await query(
    `SELECT id, user_id, bio, title, city, education, school, field_of_study,
            experience_years, education_history, skills, completion_score
     FROM profiles WHERE user_id = $1`,
    [userId],
  )

  if (!profileResult.rows.length) {
    const err = new Error('Profil introuvable.')
    err.status = 404
    throw err
  }

  const p = profileResult.rows[0]

  const achResult = await query(
    `SELECT id, title, description, image_url, project_url FROM achievements WHERE profile_id = $1 ORDER BY created_at DESC`,
    [p.id],
  )

  return {
    id: p.id,
    userId: p.user_id,
    bio: p.bio || '',
    title: p.title || '',
    city: p.city || '',
    education: p.education || '',
    school: p.school || '',
    fieldOfStudy: p.field_of_study || '',
    experienceYears: p.experience_years,
    educationHistory: p.education_history || [],
    skills: p.skills || [],
    completionScore: p.completion_score,
    achievements: achResult.rows.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      imageUrl: a.image_url || '',
      projectUrl: a.project_url || '',
    })),
  }
}

async function updateMe(userId, input) {
  const data = updateProfileSchema.parse(input)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (data.firstName || data.lastName) {
      const currentName = await client.query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [userId],
      )
      const row = currentName.rows[0] || {}
      const fn = data.firstName ?? row.first_name ?? ''
      const ln = data.lastName ?? row.last_name ?? ''
      const fullName = `${fn} ${ln}`.trim()
      await client.query(
        'UPDATE users SET first_name = $1, last_name = $2, name = $3, updated_at = NOW() WHERE id = $4',
        [fn, ln, fullName, userId],
      )
    }

    const profileResult = await client.query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [userId],
    )

    if (!profileResult.rows.length) {
      const err = new Error('Profil introuvable.')
      err.status = 404
      throw err
    }

    const profileId = profileResult.rows[0].id

    const fields = []
    const values = []
    let idx = 1

    const simpleColumns = [
      ['bio', data.bio],
      ['title', data.title],
      ['city', data.city],
      ['education', data.education],
      ['school', data.school],
      ['field_of_study', data.fieldOfStudy],
      ['experience_years', data.experienceYears],
    ]

    for (const [col, value] of simpleColumns) {
      if (value !== undefined) {
        fields.push(`${col} = $${idx}`)
        values.push(value)
        idx++
      }
    }

    if (data.skills !== undefined) {
      fields.push(`skills = $${idx}`)
      values.push(data.skills)
      idx++
    }

    if (data.educationHistory !== undefined) {
      fields.push(`education_history = $${idx}::jsonb`)
      values.push(JSON.stringify(data.educationHistory))
      idx++
    }

    if (fields.length > 0) {
      fields.push(`updated_at = NOW()`)
      values.push(profileId)
      await client.query(
        `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${idx}`,
        values,
      )
    }

    const updatedProfile = await client.query(
      `SELECT bio, title, city, education, school, field_of_study,
              experience_years, education_history, skills
       FROM profiles WHERE id = $1`,
      [profileId],
    )

    const achCount = await client.query(
      'SELECT COUNT(*)::int AS cnt FROM achievements WHERE profile_id = $1',
      [profileId],
    )

    const p = updatedProfile.rows[0]
    const score = computeCompletionScore(p, achCount.rows[0].cnt)

    await client.query(
      'UPDATE profiles SET completion_score = $1 WHERE id = $2',
      [score, profileId],
    )

    await client.query('COMMIT')

    return {
      message: 'Profil mis à jour.',
      completionScore: score,
      profile: {
        id: profileId,
        userId,
        bio: p.bio || '',
        title: p.title || '',
        city: p.city || '',
        education: p.education || '',
        school: p.school || '',
        fieldOfStudy: p.field_of_study || '',
        experienceYears: p.experience_years,
        educationHistory: p.education_history || [],
        skills: p.skills || [],
        completionScore: score,
      },
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function addAchievement(userId, input) {
  const data = addAchievementSchema.parse(input)

  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId],
  )

  if (!profileResult.rows.length) {
    const err = new Error('Profil introuvable.')
    err.status = 404
    throw err
  }

  const profileId = profileResult.rows[0].id

  const result = await query(
    `INSERT INTO achievements (profile_id, title, description, image_url, project_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, description, image_url, project_url`,
    [profileId, data.title, data.description || '', data.image_url || '', data.project_url || ''],
  )

  const achCount = await query(
    'SELECT COUNT(*)::int AS cnt FROM achievements WHERE profile_id = $1',
    [profileId],
  )

  const score = computeCompletionScore(
    (await query('SELECT bio, education, school, skills FROM profiles WHERE id = $1', [profileId]))
      .rows[0],
    achCount.rows[0].cnt,
  )

  await query('UPDATE profiles SET completion_score = $1 WHERE id = $2', [score, profileId])

  const a = result.rows[0]
  return {
    id: a.id,
    title: a.title,
    description: a.description || '',
    imageUrl: a.image_url || '',
    projectUrl: a.project_url || '',
  }
}

async function deleteAchievement(userId, achievementId) {
  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId],
  )

  if (!profileResult.rows.length) {
    const err = new Error('Profil introuvable.')
    err.status = 404
    throw err
  }

  const profileId = profileResult.rows[0].id

  const result = await query(
    'DELETE FROM achievements WHERE id = $1 AND profile_id = $2 RETURNING id',
    [achievementId, profileId],
  )

  if (!result.rows.length) {
    const err = new Error('Réalisation introuvable.')
    err.status = 404
    throw err
  }

  const achCount = await query(
    'SELECT COUNT(*)::int AS cnt FROM achievements WHERE profile_id = $1',
    [profileId],
  )

  const profileRow = (
    await query('SELECT bio, education, school, skills FROM profiles WHERE id = $1', [profileId])
  ).rows[0]

  const score = computeCompletionScore(profileRow, achCount.rows[0].cnt)
  await query('UPDATE profiles SET completion_score = $1 WHERE id = $2', [score, profileId])

  return { message: 'Réalisation supprimée.' }
}

async function getCandidate(userId) {
  const userResult = await query(
    'SELECT id, email, first_name, last_name, name, avatar, role FROM users WHERE id = $1 AND role = $2 AND is_active = TRUE',
    [userId, 'student'],
  )

  if (!userResult.rows.length) {
    const err = new Error('Candidat introuvable.')
    err.status = 404
    throw err
  }

  const u = userResult.rows[0]

  const profileResult = await query(
    `SELECT id, bio, title, city, education, school, field_of_study,
            experience_years, education_history, skills, completion_score
     FROM profiles WHERE user_id = $1`,
    [userId],
  )

  if (!profileResult.rows.length) {
    const err = new Error('Profil introuvable.')
    err.status = 404
    throw err
  }

  const p = profileResult.rows[0]

  const achResult = await query(
    'SELECT id, title, description, image_url, project_url FROM achievements WHERE profile_id = $1 ORDER BY created_at DESC',
    [p.id],
  )

  return {
    user: {
      id: u.id,
      email: u.email,
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      name: u.name || '',
      avatar: u.avatar || null,
      role: u.role,
    },
    profile: {
      id: p.id,
      userId,
      bio: p.bio || '',
      title: p.title || '',
      city: p.city || '',
      education: p.education || '',
      school: p.school || '',
      fieldOfStudy: p.field_of_study || '',
      experienceYears: p.experience_years,
      educationHistory: p.education_history || [],
      skills: p.skills || [],
      completionScore: p.completion_score,
      achievements: achResult.rows.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description || '',
        imageUrl: a.image_url || '',
        projectUrl: a.project_url || '',
      })),
    },
  }
}

module.exports = { getMe, updateMe, addAchievement, deleteAchievement, getCandidate }
