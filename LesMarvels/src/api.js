import crypto from "crypto";
import fetch from "node-fetch";

/**
 * Récupère les données de l'endpoint en utilisant les identifiants
 * particuliers developer.marvels.com
 * @param url l'end-point
 * @return {Promise<json>}
 */
export const getData = async (url, publicKey, privateKey) => {
  const timestamp = Date.now().toString();
  const hash = await getHash(publicKey, privateKey, timestamp);
  const fullUrl = `${url}?ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;

  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    throw error;
  }
};

/**
 * Calcul la valeur md5 dans l'ordre : timestamp+privateKey+publicKey
 * cf documentation developer.marvels.com
 * @param publicKey
 * @param privateKey
 * @param timestamp
 * @return {Promise<ArrayBuffer>} en hexadecimal
 */
export const getHash = async (publicKey, privateKey, timestamp) => {
  const dataToHash = `${timestamp}${privateKey}${publicKey}`;
  const hash = crypto.createHash("md5").update(dataToHash).digest("hex");
  return hash;
};


/**
 * Filtre les personnages avec une image valide et retourne un tableau formaté
 * @param results Les résultats bruts de l'API
 * @return {Array<Object>} Tableau de personnages formatés
 */
export const filterCharacters = (results) => {
    return results
        .filter((character) => {
            const thumbnail = character.thumbnail;
            return (
                thumbnail &&
                !thumbnail.path.includes('image_not_available')
            );
        })
        .map((character) => ({
            name: character.name,
            description: character.description || 'Description non disponible',
            imageUrl: `${character.thumbnail.path}/portrait_xlarge.${character.thumbnail.extension}`
        }));
};
