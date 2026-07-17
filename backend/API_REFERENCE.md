📡 TABLE DES API COMPLÈTE ET DÉFINITIVE (MVP V1)
Base URL : https://ton-domaine.com/api/v1 (ou http://localhost:5000/api/v1 en dev)
Authentification : Toutes les routes sauf auth/register et auth/login nécessitent un token JWT dans le header Authorization: Bearer <token>.

#	User Story	Méthode	Endpoint	Description	Corps de la requête (body) / Paramètres	Réponse succès (exemple)
🔐 AUTHENTIFICATION						
1	US-01	POST	/auth/register	Inscription étudiant ou recruteur	{ "email": "aicha@email.com", "password": "secret123", "role": "student" }	{ "id": "uuid", "email": "aicha@email.com", "role": "student" }
2	US-02	POST	/auth/login	Connexion et réception du token JWT	{ "email": "aicha@email.com", "password": "secret123" }	{ "token": "jwt_token_here", "user": { "id": "...", "role": "student" } }
3	US-02	POST	/auth/logout	Déconnexion (invalider token côté client)	(aucun body)	{ "message": "Logged out successfully" }
👤 PROFIL ÉTUDIANT						
4	US-03	GET	/profile/me	Récupérer mon profil complet	(token)	{ "id": "...", "bio": "...", "education": "...", "skills": ["JS","React"], "completionScore": 60 }
5	US-04	PUT	/profile/me	Mettre à jour mon profil (bio, formation, compétences)	{ "bio": "Passionnée par le marketing", "education": "Master Marketing", "skills": ["SEO", "Content"] }	{ "message": "Profile updated", "completionScore": 80 }
6	US-03	POST	/profile/achievements	Ajouter une réalisation (portfolio vivant)	{ "title": "Campagne 2025", "description": "J'ai augmenté le trafic de 50%", "image_url": "https://cloudinary.com/..." }	{ "id": "...", "title": "Campagne 2025", ... }
7	Implicite	DELETE	/profile/achievements/:id	Supprimer une réalisation	(token)	{ "message": "Achievement deleted" }
📢 OFFRES (EMPLOI & FREELANCE)						
8	US-06	GET	/offers	Liste paginée des offres + filtres	Query params : ?city=Douala&type=employment&q=marketing&page=1	{ "offers": [ { "id":"...", "title":"Dev React", "city":"Douala", "minSalary": 500000, ... } ], "total": 10 }
9	US-05	POST	/offers	Publier une offre (recruteur vérifié uniquement)	{ "title": "Développeur Fullstack", "description": "CDI à Douala", "type": "employment", "city": "Douala", "minSalary": 600000, "maxSalary": 900000, "deadline": "2026-10-30" }	{ "id": "...", "title": "...", "status": "active" }
10	Implicite	PUT	/offers/:id	Modifier une offre (seul le propriétaire)	{ "title": "Nouveau titre", ... } (champs optionnels)	{ "message": "Offer updated" }
11	Implicite	DELETE	/offers/:id	Clôturer/Supprimer une offre	(token)	{ "message": "Offer closed" }
📄 CANDIDATURES						
12	US-07	POST	/applications	Postuler à une offre (en 1 clic)	{ "offer_id": "uuid_de_l_offre" }	{ "id": "...", "status": "submitted", "applied_at": "2026-..." }
13	US-08	GET	/applications/me	Voir le suivi de MES candidatures (étudiant)	(token)	[ { "id":"...", "offer": { "title":"..." }, "status": "viewed", "updated_at": "..." } ]
14	US-08	PUT	/applications/:id/status	Changer le statut d'une candidature (recruteur)	{ "status": "viewed" } (possible: viewed, in_review, rejected, accepted)	{ "id":"...", "status": "viewed", "updated_at": "..." }
✅ VÉRIFICATION RECRUTEUR						
15	US-09	POST	/company/verify	Soumettre un justificatif (registre de commerce)	{ "document_url": "https://cloudinary.com/..." }	{ "status": "pending", "message": "Document submitted" }
16	US-09	GET	/company/status	Voir le statut de ma vérification	(token)	{ "status": "verified" } (ou pending / rejected)
🛡️ ADMINISTRATION						
17	US-10	GET	/admin/verifications	Liste des recruteurs en attente de validation	(token admin)	[ { "userId":"...", "companyName":"...", "doc_url":"...", "submitted_at":"..." } ]
18	US-10	PUT	/admin/verifications/:userId	Approuver ou refuser un recruteur	{ "action": "approve" } (ou "reject")	{ "message": "User verified" }
19	US-12	GET	/admin/reports	Liste des signalements (profils/offres)	(token admin)	[ { "id":"...", "target_type":"offer", "reason":"...", "reported_at":"..." } ]
20	US-12	PUT	/admin/offers/:id/disable	Désactiver une offre signalée	(token admin)	{ "message": "Offer disabled" }
🔔 NOTIFICATIONS						
21	US-11	GET	/notifications	Récupérer mes notifications (non lues en premier)	(token) + Query ?limit=20	[ { "id":"...", "type":"status_update", "content":"Votre candidature a été vue", "is_read":false } ]
22	US-11	PUT	/notifications/:id/read	Marquer une notification comme lue	(token)	{ "message": "Notification marked as read" }