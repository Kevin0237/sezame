
SEZAME
 
Cahier des charges & Spécifications fonctionnelles (SRS)
Périmètre MVP — Version 1.0
Douala, Cameroun — Juillet 2026
Document technique et fonctionnel de référence pour le développement du produit minimum viable (MVP)
 
Sommaire
1. Introduction
2. Vision produit et personas
3. Périmètre du MVP
4. Exigences fonctionnelles
5. Exigences non fonctionnelles
6. Architecture technique proposée
7. Modèle de données simplifié
8. Contraintes du projet
9. Plan de release — de zéro au MVP
10. Critères de succès du MVP
11. Risques et hypothèses
12. Annexe — Glossaire
 
1. Introduction
1.1 Objet du document
Ce document formalise les spécifications fonctionnelles et techniques nécessaires au développement du produit minimum viable (MVP) de Sezame. Il traduit le positionnement stratégique, le Business Model Canvas et le plan financier déjà validés en un périmètre développable, priorisé pour une mise en production la plus rapide possible.
Il s'adresse en priorité à l'équipe de développement (actuellement restreinte) et sert de référence unique pour éviter toute dérive de périmètre (« scope creep ») pendant la phase MVP.
1.2 Contexte du projet
Sezame est une plateforme camerounaise qui accompagne les étudiants sortants et jeunes diplômés dans leur transition professionnelle, en couvrant salariat, entrepreneuriat et freelancing. Le repositionnement stratégique déjà réalisé a établi que le modèle doit s'adapter aux réalités locales : économie informelle dominante, faible bancarisation, fracture numérique et recrutement fondé sur la confiance et les réseaux personnels.
Le dossier de financement (positionnement stratégique, BMC, plan financier, executive summary) couvre la vision complète du produit à 3 ans. Ce document ne reprend pas cette vision dans son intégralité : il en extrait un sous-ensemble volontairement restreint, capable d'être construit et testé rapidement par une petite équipe.
1.3 Objectif du MVP
L'objectif du MVP n'est pas de construire l'ensemble des fonctionnalités du dossier de financement, mais de valider le plus vite possible l'hypothèse centrale du produit avec de vrais utilisateurs :
•	Les étudiants et jeunes diplômés créent et utilisent un profil « portfolio vivant » plus volontiers qu'un CV classique.
•	Les recruteurs (PME comme grandes entreprises) publient des offres et valorisent la transparence du suivi de candidature.
•	La combinaison des deux crée une boucle d'usage suffisante pour justifier l'investissement dans les fonctionnalités plus lourdes (paiement Mobile Money, WhatsApp Business API, EOR, PPP) prévues pour les versions suivantes.
Toute fonctionnalité qui ne sert pas directement cette validation est explicitement reportée (voir section 3.2).
1.4 Périmètre du document
Ce document couvre les exigences fonctionnelles et non fonctionnelles du MVP, une proposition d'architecture technique cohérente avec la stack déjà maîtrisée par l'équipe, un modèle de données simplifié, ainsi qu'un plan de release en phases courtes. Il ne couvre pas les aspects juridiques (statuts, conditions générales), qui font l'objet d'un document séparé.
2. Vision produit et personas
2.1 Vision produit (rappel)
Sezame veut devenir le hub de référence de la « vie professionnelle hybride » au Cameroun : un seul profil pour documenter son parcours, qu'il mène vers un emploi salarié, la création d'une activité, ou des missions freelance. Le MVP se concentre sur la brique la plus universelle de cette vision : le profil et la mise en relation via des offres.
2.2 Personas prioritaires du MVP
Persona	Profil	Besoin principal adressé par le MVP
Aïcha, 23 ans	Jeune diplômée en marketing digital, Douala	Se présenter sans CV formel via des réalisations concrètes ; suivre ses candidatures sans angoisse du silence
Junior, 26 ans	Freelance développeur autodidacte	Construire un profil crédible et être repéré pour des missions, même sans diplôme
Mme Ebogo	Responsable RH d'une PME locale (10-50 employés)	Publier une offre simplement, recevoir des profils pertinents et vérifiés
Recruteur.tech SARL	Startup tech en croissance, recrutement fréquent	Suivre plusieurs offres actives et gérer les candidatures reçues sans outil lourd

Les personas institutionnels (multinationales EOR, ministères, ONG) ne sont pas prioritaires pour le MVP : ils interviennent à un stade où la base d'utilisateurs et de profils est déjà significative (voir section 3.2).
3. Périmètre du MVP
3.1 Fonctionnalités incluses (in scope)
Le MVP retient les fonctionnalités qui incarnent directement la différenciation de Sezame, sans dépendance à une intégration tierce complexe :
Module	Fonctionnalité MVP
Comptes	Inscription / connexion étudiant & recruteur, e-mail + mot de passe
Profil	Portfolio vivant : bio, compétences, réalisations (photos, description), formation
Offres	Publication d'offres d'emploi et de missions freelance par les recruteurs
Candidature	Postuler à une offre + tableau de suivi de statut (envoyée / vue / en cours / refusée / acceptée)
Vérification	Vérification manuelle des recruteurs par l'équipe Sezame (label « recruteur vérifié »)
Transparence	Champ salaire obligatoire à la publication d'une offre
Recherche	Recherche et filtres simples (secteur, ville, type de contrat)
Notifications	Notifications in-app (changement de statut de candidature, nouvelle offre pertinente)
Administration	Back-office minimal : validation des recruteurs, modération des offres et profils

3.2 Fonctionnalités reportées (hors MVP, V2+)
Ces fonctionnalités appartiennent pleinement à la vision produit, mais dépendent d'intégrations externes ou d'un volume d'utilisateurs que le MVP doit d'abord générer :
•	Paiement intégré Mobile Money (Orange Money, MTN MoMo) — nécessaire pour les commissions, pas pour valider l'usage du profil et des offres.
•	Intégration WhatsApp Business API et communauté internalisée.
•	Cooptation formalisée et rémunérée.
•	Offre EOR / portage salarial et contrats institutionnels (PPP).
•	Rapport sectoriel premium basé sur les données de la plateforme.
•	Points d'entrée SMS / USSD pour les zones à faible connectivité.
•	Application mobile native complète (le MVP peut démarrer en web mobile-first, voir 6.1).
3.3 Justification des choix de priorisation
Le critère de tri retenu est simple : une fonctionnalité entre dans le MVP si son absence empêche de tester l'hypothèse centrale (profil + mise en relation + transparence), et en sort si elle ajoute de la complexité technique ou opérationnelle sans être nécessaire pour ce test. Le paiement Mobile Money, par exemple, conditionne la monétisation mais pas la validation de l'usage — il est donc repoussé sans remettre en cause le modèle économique à moyen terme.
4. Exigences fonctionnelles
Chaque module est décrit sous forme d'user stories avec critères d'acceptation, dans un format directement exploitable pour le découpage en tickets de développement.
4.1 Authentification et comptes
US-01 — Inscription
En tant que nouvel utilisateur, je veux créer un compte en tant qu'étudiant/jeune diplômé ou recruteur, afin d'accéder aux fonctionnalités correspondantes.
•	Critère : formulaire e-mail + mot de passe + choix du type de compte.
•	Critère : validation d'e-mail requise avant accès complet.
•	Critère : mot de passe stocké hashé (bcrypt ou équivalent), jamais en clair.
US-02 — Connexion / session
En tant qu'utilisateur inscrit, je veux me connecter et rester authentifié de façon sécurisée (JWT), afin d'accéder à mon espace sans ressaisir mes identifiants à chaque action.
•	Critère : token JWT avec expiration et rafraîchissement.
•	Critère : déconnexion invalide la session côté client.
4.2 Profil / Portfolio vivant
US-03 — Création de profil étudiant
En tant qu'étudiant ou jeune diplômé, je veux créer un profil avec ma formation, mes compétences et des réalisations concrètes (texte + photos), afin de me présenter sans dépendre uniquement d'un CV formel.
•	Critère : au moins un champ « réalisation » avec titre, description et image.
•	Critère : le profil est consultable par les recruteurs après publication.
•	Critère : upload d'image limité en taille et compressé côté serveur.
US-04 — Édition et complétude du profil
En tant qu'étudiant, je veux voir un indicateur de complétude de mon profil, afin de savoir quoi améliorer pour être plus visible.
•	Critère : barre de progression basée sur les champs remplis (bio, compétences, ≥1 réalisation, formation).
4.3 Offres (emploi et missions freelance)
US-05 — Publication d'une offre
En tant que recruteur vérifié, je veux publier une offre d'emploi ou de mission freelance avec un champ salaire obligatoire, afin d'attirer des candidats de façon transparente.
•	Critère : formulaire avec titre, description, type (emploi/mission), ville, fourchette de salaire (obligatoire), date limite.
•	Critère : impossible de publier tant que le compte recruteur n'est pas vérifié (voir 4.5).
US-06 — Consultation et filtres
En tant qu'étudiant, je veux parcourir les offres et les filtrer par secteur, ville et type de contrat, afin de trouver rapidement les opportunités pertinentes.
•	Critère : liste paginée, filtres combinables, recherche par mot-clé sur le titre.
4.4 Candidature et suivi
US-07 — Postuler à une offre
En tant qu'étudiant, je veux postuler à une offre en un clic à partir de mon profil, afin de ne pas avoir à ressaisir mes informations à chaque candidature.
•	Critère : la candidature associe le profil complet à l'offre, sans re-saisie.
•	Critère : impossible de postuler deux fois à la même offre.
US-08 — Suivi de candidature (différenciateur clé)
En tant qu'étudiant, je veux voir en temps réel le statut de chaque candidature envoyée (envoyée / vue / en cours d'examen / refusée / acceptée), afin de ne plus subir le silence radio identifié comme irritant majeur du marché.
•	Critère : le recruteur peut faire évoluer le statut depuis son tableau de bord.
•	Critère : chaque changement de statut génère une notification pour le candidat.
4.5 Vérification recruteur
US-09 — Demande de vérification
En tant que recruteur, je veux soumettre les documents justifiant l'existence de mon entreprise, afin d'obtenir le label « recruteur vérifié » et de publier des offres.
•	Critère : upload d'au moins un document justificatif (registre de commerce ou équivalent).
•	Critère : statut du compte visible (en attente / vérifié / refusé).
US-10 — Validation côté administration
En tant qu'administrateur Sezame, je veux consulter les demandes de vérification en attente et les approuver ou refuser, afin de garantir la fiabilité des recruteurs actifs sur la plateforme.
•	Critère : validation manuelle en MVP (pas d'automatisation) — volumes attendus faibles au lancement.
4.6 Notifications
US-11 — Notifications in-app
En tant qu'utilisateur, je veux recevoir une notification in-app lors d'un événement me concernant (changement de statut, nouvelle offre correspondant à mon profil), afin de rester informé sans avoir à revenir vérifier manuellement.
•	Critère : centre de notifications avec compteur non lues.
•	Critère : e-mail de notification pour les événements critiques (changement de statut de candidature) — pas de WhatsApp en MVP.
4.7 Administration
US-12 — Back-office minimal
En tant qu'administrateur, je veux un espace simple pour valider les recruteurs, modérer les profils et les offres signalées, afin de garder la plateforme fiable sans outil complexe.
•	Critère : liste des comptes en attente de vérification, liste des signalements, actions activer/désactiver un compte ou une offre.
5. Exigences non fonctionnelles
5.1 Performance
•	Temps de chargement des pages principales < 3 secondes sur connexion 3G standard.
•	Images optimisées et compressées automatiquement à l'upload (poids cible < 300 Ko par image affichée).
5.2 Sécurité
•	Chiffrement HTTPS obligatoire sur l'ensemble des échanges.
•	Mots de passe hashés, jamais stockés ou journalisés en clair.
•	Validation et assainissement de toutes les entrées utilisateur côté serveur (protection injection SQL / XSS).
•	Accès au back-office restreint par rôle (admin uniquement).
5.3 Faible bande passante et mobile-first
•	Interface pensée mobile-first, utilisable sur des connexions instables.
•	Dégradation progressive : les fonctionnalités essentielles (consulter une offre, suivre une candidature) doivent rester utilisables même en cas de chargement d'image lent.
5.4 Localisation
•	Interface entièrement en français pour le MVP (cible principale francophone).
•	Devise affichée en FCFA par défaut.
5.5 Disponibilité et hébergement
•	Hébergement sur un stack gratuit ou à très faible coût pour la phase MVP, cohérent avec le plan financier (ex. Supabase pour PostgreSQL, Render ou équivalent pour l'API, Vercel pour le front web).
•	Objectif de disponibilité MVP : best effort, sans SLA formel — priorité à la vitesse d'itération plutôt qu'à la haute disponibilité à ce stade.
6. Architecture technique proposée
6.1 Stack technique
La stack proposée s'appuie sur les technologies déjà maîtrisées par l'équipe de développement, afin de maximiser la vitesse de livraison du MVP.
Couche	Choix technique	Justification
Frontend web	React (Vite) + Tailwind CSS	Rapide à mettre en place, léger, cohérent avec l'expérience déjà acquise
Mobile (si nécessaire en MVP)	React Native / Expo	Réutilisation de composants et de logique avec le web ; publication rapide via Expo Go pour les tests
Backend / API	Node.js (Express ou Fastify)	Écosystème déjà maîtrisé, développement rapide d'API REST
Base de données	PostgreSQL	Relationnel, adapté aux entités du domaine (profils, offres, candidatures)
Authentification	JWT + bcrypt	Standard, simple à implémenter sans dépendance lourde
Stockage d'images	Service de stockage objet (ex. Supabase Storage / Cloudinary)	Évite de gérer le stockage de fichiers sur le serveur applicatif
Hébergement API	Render ou équivalent (offre gratuite/faible coût)	Cohérent avec le plan financier prévisionnel
Hébergement front web	Vercel	Déploiement continu simple depuis Git

Recommandation : démarrer le MVP en web mobile-first (React + Tailwind, responsive) plutôt qu'en application mobile native. Cela réduit le périmètre technique de moitié pour la première mise en production, tout en restant testable sur mobile via le navigateur. La déclinaison React Native pourra être dérivée une fois le cœur fonctionnel validé, en réutilisant la logique métier et les appels API déjà construits.
6.2 Architecture globale
Le MVP est construit en architecture simple à trois niveaux plutôt qu'en microservices, afin de limiter la charge opérationnelle pendant la phase de validation :
1.	Client web (React) — interface étudiant, interface recruteur, back-office admin (accessible via rôle).
2.	API monolithique (Node.js) — expose les routes REST pour comptes, profils, offres, candidatures, notifications, administration.
3.	Base de données PostgreSQL unique — toutes les entités du MVP y sont stockées ; une séparation en microservices (Gateway, IAM, Gamification, etc., comme envisagé dans la vision à 3 ans) n'est pertinente qu'une fois le volume d'usage et l'équipe technique plus importants.
Cette simplification est un choix délibéré : la vision long terme du dossier de financement prévoit une architecture en microservices, mais l'introduire dès le MVP ralentirait la livraison sans bénéfice mesurable à ce stade d'usage.
6.3 Intégrations externes anticipées (non actives en MVP)
Le modèle de données et l'architecture API doivent être conçus pour ne pas bloquer l'ajout ultérieur de ces intégrations, sans les développer dès le MVP :
•	Mobile Money (Orange Money / MTN MoMo) — pour les commissions et paiements futurs.
•	WhatsApp Business API — pour les notifications et la communauté internalisée.
•	Service de vérification documentaire automatisée — pour remplacer la validation manuelle des recruteurs à plus grande échelle.
7. Modèle de données simplifié
Entités principales du MVP et leurs relations essentielles, avant tout raffinement lors de la conception détaillée :
Entité	Champs clés	Relations
User	id, email, mot_de_passe_hash, rôle (étudiant/recruteur/admin), statut_vérification	1—1 avec Profile ou Company selon le rôle
Profile	id, user_id, bio, formation, compétences[], complétude	1—N avec Achievement, 1—N avec Application
Achievement	id, profile_id, titre, description, image_url	N—1 avec Profile
Company	id, user_id, nom, secteur, document_verif_url, statut	1—N avec Offer
Offer	id, company_id, titre, description, type (emploi/mission), ville, salaire_min, salaire_max, date_limite, statut	1—N avec Application
Application	id, offer_id, profile_id, statut, date_candidature, historique_statuts	N—1 avec Offer, N—1 avec Profile
Notification	id, user_id, type, contenu, lu (bool), date	N—1 avec User

Le champ salaire (salaire_min / salaire_max) est volontairement non-nullable sur Offer, afin de faire respecter au niveau base de données l'exigence de transparence salariale identifiée comme différenciateur clé face à Emploi.cm.
8. Contraintes du projet
8.1 Contraintes de délai
L'objectif affiché est la mise en production la plus rapide possible du MVP. Le plan de release (section 9) est construit sur cette base, avec un périmètre volontairement minimal plutôt qu'un calendrier optimiste sur un périmètre large.
8.2 Contraintes de ressources
•	Équipe de développement restreinte (1 à 2 développeurs au lancement), cohérente avec l'équipe fondatrice décrite dans le dossier de financement (CEO / CTO / Community Manager).
•	Budget de lancement limité — priorité aux outils gratuits ou à faible coût (voir 6.1) plutôt qu'à des services managés coûteux.
8.3 Contraintes techniques
•	Pas de disponibilité immédiate pour développer les intégrations Mobile Money et WhatsApp Business API en interne — ces briques nécessitent des démarches d'accès (comptes marchands, validation API) qui ne doivent pas bloquer le MVP.
•	La vérification recruteur reste manuelle en MVP : le volume attendu au lancement (quelques dizaines de recruteurs) ne justifie pas une automatisation immédiate.
9. Plan de release — de zéro au MVP
Découpage en quatre phases de deux semaines, pensé pour une équipe de 1 à 2 développeurs. Chaque phase livre un incrément testable, plutôt qu'un ensemble de fonctionnalités isolées difficiles à valider.
Phase 1 (semaines 1-2) — Fondations
•	Mise en place du projet (repo, CI basique, environnements).
•	Modèle de données et API : comptes, authentification (US-01, US-02).
•	Squelette frontend (navigation, layout mobile-first).
Phase 2 (semaines 3-4) — Profil et offres
•	Création et édition de profil étudiant (US-03, US-04).
•	Publication d'offres côté recruteur, avec champ salaire obligatoire (US-05).
•	Consultation et filtres des offres (US-06).
Phase 3 (semaines 5-6) — Boucle de mise en relation
•	Candidature en un clic (US-07).
•	Tableau de suivi de candidature, mise à jour de statut côté recruteur (US-08).
•	Notifications in-app et e-mail sur changement de statut (US-11).
Phase 4 (semaines 7-8) — Confiance et mise en production
•	Vérification recruteur : soumission de documents et validation admin (US-09, US-10).
•	Back-office minimal (US-12).
•	Tests utilisateurs internes, corrections, déploiement en production (Vercel + Render + Supabase).
Soit un objectif de 8 semaines entre le démarrage du développement et un MVP en production, sous réserve de disponibilité de l'équipe. Ce délai pourra être resserré si la phase 4 est partiellement parallélisée avec la phase 3.
10. Critères de succès du MVP
Le MVP est jugé concluant s'il permet d'observer, sur les 4 à 8 premières semaines suivant le lancement :
•	Au moins 70% des profils créés atteignent un niveau de complétude jugé suffisant (bio + compétences + une réalisation minimum).
•	Au moins 10 recruteurs vérifiés publient une offre active.
•	Un taux de candidature par offre observable et comparable, permettant de mesurer si la transparence du suivi augmente l'engagement par rapport aux irritants documentés d'Emploi.cm.
•	Un retour qualitatif des premiers utilisateurs confirmant (ou infirmant) l'intérêt du portfolio vivant par rapport à un CV classique.
Ces critères, volontairement qualitatifs et quantitatifs à la fois, conditionnent la décision d'investir dans les fonctionnalités de la V2 (paiement, WhatsApp, EOR/PPP) plutôt que de les construire par anticipation.
11. Risques et hypothèses
Risque / hypothèse	Impact	Mitigation
Faible volume de recruteurs au lancement	Peu d'offres disponibles, boucle de valeur non testable	Démarchage manuel ciblé de quelques dizaines de PME/startups à Douala/Yaoundé avant le lancement public
Vérification manuelle non scalable	Délai de publication d'offre trop long	Volume MVP attendu faible ; automatisation prévue seulement si le volume le justifie
Équipe de développement restreinte	Retard sur le calendrier de 8 semaines	Périmètre volontairement minimal (section 3.2) ; toute fonctionnalité non critique est reportée sans négociation
Adoption du portfolio vivant incertaine	Hypothèse centrale du produit non validée	Le MVP est conçu spécifiquement pour tester cette hypothèse en priorité (voir section 10)
12. Annexe — Glossaire
•	MVP : Minimum Viable Product — version minimale d'un produit permettant de valider ses hypothèses centrales auprès de vrais utilisateurs.
•	Portfolio vivant : profil utilisateur basé sur des réalisations concrètes plutôt que sur un CV statique.
•	EOR : Employer of Record — dispositif de portage salarial permettant l'embauche conforme de talents à distance.
•	PPP : Partenariat Public-Privé, notamment avec des ministères ou ONG sur des programmes d'emploi jeunes.
•	JWT : JSON Web Token — standard de jeton utilisé pour l'authentification des sessions utilisateur.
•	US : User Story — description d'une fonctionnalité du point de vue de l'utilisateur, utilisée pour le découpage en tickets de développement.
