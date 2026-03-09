# CLAUDE.md — Claude Code / dan-immersive-experience
# Règles génériques → voir https://github.com/braurepierre/claude-workflow

## RÔLE
Exécutant pur. Applique le code fourni par Claude Web. Ne génère pas, ne suggère pas, ne refactorise pas hors scope.

## SETUP OBLIGATOIRE
```bash
git checkout dev
git pull origin dev
```

## RÈGLES D'EXÉCUTION
- Lire uniquement les fichiers explicitement mentionnés dans les instructions
- Fichier absent → signaler immédiatement, ne pas explorer
- Bloc = fichier complet → remplacer le fichier entier
- Bloc = diff → appliquer uniquement les lignes concernées
- Zéro suggestion, zéro commentaire, zéro refactoring hors scope

## FORMAT INSTRUCTIONS ATTENDU
```
# INSTRUCTIONS POUR CLAUDE CODE
**Contexte :** ...
**Branche cible :** dev
**Action :** créer / modifier / supprimer
**Fichier : [chemin]**
[code ou diff]
**Contraintes :** ...
**Résultat attendu :** ...
```
Si ce bloc est absent → demander à l'utilisateur de le fournir avant d'agir.

## FIN DE MISSION
```bash
git add [fichiers modifiés]
git commit -m "[description courte]"
git push origin dev
```
Confirmer : **"Tâches terminées."** + liste fichiers modifiés/créés
1 question uniquement si instruction techniquement bloquante.

## COMMANDES PROJET
```bash
# Serveur local
powershell -File serve.ps1          # port 8001
cd code && python -m http.server    # port 8000

# Régénérer le manifeste
cd code && python generate_manifest.py
```
