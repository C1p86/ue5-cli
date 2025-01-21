import fs from 'fs';
import path from 'path';

/**
 * Itera attraverso i file di una cartella in modo sincrono e restituisce i percorsi
 * dei file con una specifica estensione, escludendo la directory radice.
 * 
 * @param {string} dir - La directory di partenza.
 * @param {string} fileExtension - L'estensione del file (ad esempio ".txt").
 * @returns {string[]} - Un array di percorsi dei file con l'estensione specificata.
 */
export function iterateFilesSync(dir, fileExtension, ignoreRoot = false) {
    const result = [];

    // Leggi i file della directory in modo sincrono
    const files = fs.readdirSync(dir);

    // Itera sui file
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Se è una directory, chiama ricorsivamente la funzione
            result.push(...iterateFilesSync(fullPath, fileExtension));
        } else if (path.extname(file) === fileExtension && !ignoreRoot) {
            // Se è un file con l'estensione richiesta, aggiungilo all'array dei risultati
            result.push(fullPath);
        }
    });

    return result;
}

