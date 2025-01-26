import { Client } from '@notionhq/client'
import { convertMarkdownsToNotionPages } from './markdown.js'

const token = 'ntn_ih576653902a4WljVYEDG8sWLedOTiCQhxNhT1mCSUQepV'
const databaseId = '1860225f0a4e802097d0f9fdc63826ae'

const docDirs = [
    'doc',
    'doc2',
]

async function main(docDirs) {
    const notion = new Client({ auth: token })

    const notionPages = docDirs.map(docDir => convertMarkdownsToNotionPages(docDir)).flat()
    const failedNotionPages = []

    // 1. データベース内の全ページを取得
    const response = await notion.databases.query({
        database_id: databaseId,
    })

    console.log(`Found ${response.results.length} pages.`)

    // 2. データベースを空へ（各ページを削除）
    for (const oldNotionPage of response.results) {
        const pageId = oldNotionPage.id
        await notion.blocks.delete({ block_id: pageId })
        console.log(`Deleted page: ${pageId}`)
    }

    // 3. ページをアップロード
    for (const notionPage of notionPages) {
        try {
            const pageObject = await notion.pages.create({
                parent: {
                    database_id: databaseId,
                },
                properties: { // 更新対象のデータベースのカラムに合わせて変更
                    Name: {
                        type: 'title',
                        title: [{ text: { content: notionPage.name } }],
                    },
                    Tags: {
                        type: 'multi_select',
                        multi_select: notionPage.tags.map(tag => ({ name: tag })),
                    },
                    Origin: {
                        type: 'url',
                        url: notionPage.origin
                    },
                },
                children: notionPage.body,
            })

            await notion.comments.create({
                parent: {
                    page_id: pageObject.id
                },
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'GitHubのbackendリポジトリから自動同期されているドキュメントです、同期都度ページを作り直すためページURLで参照してもすぐ無くなります',
                            link: null,
                        },
                        plain_text: 'GitHubのbackendリポジトリから自動同期されているドキュメントです、同期都度ページを作り直すためページURLで参照してもすぐ無くなります',
                    }
                ]
            })
        } catch (e) {
            console.error(`${notionPage.name}の追加に失敗: `, e)
            failedNotionPages.push(notionPage.name)
        }
    }

    console.log('ページ作成に失敗したノート: ', failedNotionPages)
}

main(docDirs)
