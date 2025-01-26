import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { markdownToBlocks } from '@tryfabric/martian'

function getAllMarkdownRecursive(dirPath, markdownFiles = []) {
    const files = readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);

        if (statSync(fullPath).isDirectory()) {
            // 再帰的にディレクトリを探索
            getAllMarkdownRecursive(fullPath, markdownFiles);
        } else if (path.extname(file) === '.md') {
            // 拡張子が .md のファイルをリストに追加
            markdownFiles.push(fullPath);
        }
    });

    return markdownFiles;
}

export function convertMarkdownsToNotionPages(docDir) {
    const filePaths = getAllMarkdownRecursive(docDir)
    const notionPages = [];

    filePaths.forEach(filePath => {
        const content = readFileSync(filePath)
        const matterResult = matter(content)

        if (matterResult.data.syncToNotion === true) {
            notionPages.push({
                name: matterResult.data.name ?? 'undefined',
                tags: matterResult.data.tags ?? [],
                // block objectsに変換
                body: markdownToBlocks(matterResult.content),
                origin: new URL('https://github.com/nazonohito51/notion_test/blob/main/' + filePath).toString(),
            })
        }
    })

    return notionPages
}
