import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { markdownToBlocks } from '@tryfabric/martian'

export function getAllNotes(notePath) {
    const fileNames = readdirSync(notePath)

    const notes = fileNames.map(name => {
        const content = readFileSync(path.join(notePath, name))
        const matterResult = matter(content)

        return {
            name: name.replace(/.md$/, ''),
            tags: matterResult.data.tags,
            // block objectsに変換
            body: markdownToBlocks(matterResult.content),
        }
    })

    return notes
}
