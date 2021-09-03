require('dotenv').config();
const contentful = require("contentful");
const contentfulClient = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});
const algolia = require('algoliasearch');
const algoliaClient = algolia(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_API_KEY);


async function getContent() {
    const entries = await contentfulClient.getEntries();

    return entries.items
}

function transformContent(content) {
    console.log(JSON.stringify(content[0], null, 2));
    return content.map(entry => {
        return {
            objectID: entry.sys.id,
            ...entry.fields,
            ...entry
        }
    })
}

async function pushToAlgolia(content) {
    const index = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_ID);
    return await index.saveObjects(content);
}

(async () => {
    const entries = await getContent();
    const transformedEntries = transformContent(entries);
    return await pushToAlgolia(transformedEntries);
})();