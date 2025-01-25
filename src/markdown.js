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

    return filePaths.map(filePath => {
        const content = readFileSync(filePath)
        const matterResult = matter(content)

        return {
            name: path.basename(filePath, '.md'),
            tags: matterResult.data.tags,
            // block objectsに変換
            body: markdownToBlocks(matterResult.content),
        }
    })
}
