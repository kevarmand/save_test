#!/bin/bash

#faire un script qui va chercher tous les fichiers nomme dans une variable et les concatene 
# dm/src/app.js
# notifications/src/app.js
# realtime/src/apps/front.app.js
# realtime/src/apps/internal.app.js
SRC_LIST=(
    "dm/src/app.js"
    "dm/src/routes/dm.routes.js"
    "dm/src/controllers/dm.controller.js"
    "dm/src/services/dm.service.js"
    "dm/src/repositories/dm.repository.js"
    "dm/src/validation/dm.validation.js"
    "dm/src/clients/realtime.client.js"
    "dm/src/clients/social.client.js"
    "dm/src/clients/user.client.js"
    "dm/prisma/schema.prisma"
    "dm/src/errors/AppError.js"
    "dm/src/errors/errorCodes.js"
    "dm/src/errors/errorHandler.js"
)
OUTPUT_FILE="output.txt"

# Vider le fichier de sortie s'il existe déjà
> "$OUTPUT_FILE"
#creer le fichier de sortie s'il n'existe pas
touch "$OUTPUT_FILE"

# Parcourir la liste des fichiers source et les concaténer dans le fichier de sortie
for FILE in "${SRC_LIST[@]}"; do
    if [[ -f "$FILE" ]]; then
        echo "Appending $FILE to $OUTPUT_FILE"
        echo "===== FILE: $FILE =====" >> "$OUTPUT_FILE"
        cat "$FILE" >> "$OUTPUT_FILE"
        echo -e "\n" >> "$OUTPUT_FILE"
    else
        echo "Warning: $FILE not found, skipping."
    fi
done
echo "All files have been appended to $OUTPUT_FILE"
