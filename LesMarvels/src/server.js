import Fastify from "fastify";
import fastifyView from "@fastify/view";
import handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { getData, filterCharacters } from "./api.js";

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de l'instance Fastify avec logs activés
const fastify = Fastify({ logger: true });

// Configuration du moteur de template Handlebars
fastify.register(fastifyView, {
  engine: { handlebars },
  root: path.join(__dirname, "../templates"), // Répertoire des templates
  options: {
    partials: {
      header: ("/header.hbs"),
      footer: ("/footer.hbs"),
    },
  },
});

// Route principale pour afficher les personnages Marvel
fastify.get("/", async (request, reply) => {
  const publicKey = "d4861bd31a8437995440c3ea1e64bb99"; // Remplacez par votre clé publique
  const privateKey = "420ba1f717c7736b66aad1d03ab0e09d83bf7e6c"; // Remplacez par votre clé privée
  const apiUrl = "https://gateway.marvel.com/v1/public/characters";

  try {
    const rawData = await getData(apiUrl, publicKey, privateKey);
    const characters = filterCharacters(rawData.data.results); // Filtrage des données
    return reply.view("index.hbs", { characters }); // Affichage avec Handlebars
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: "Erreur lors de la récupération des personnages." });
  }
});

// Démarrage du serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("Serveur en ligne sur http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
