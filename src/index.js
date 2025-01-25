import { Client } from '@notionhq/client'
import { getAllNotes } from './markdown.js'

const token = 'ntn_ih576653902a4WljVYEDG8sWLedOTiCQhxNhT1mCSUQepV'
const databaseId = '1860225f0a4e802097d0f9fdc63826ae'

async function main() {
    const notion = new Client({ auth: token })

    const notes = getAllNotes('../doc')
    const failedNotes = []

    // 1. データベース内の全ページを取得
    const response = await notion.databases.query({
        database_id: databaseId,
    })

    console.log(`Found ${response.results.length} pages.`)

    // 2. データベースを空へ（各ページを削除）
    for (const page of response.results) {
        const pageId = page.id
        await notion.blocks.delete({ block_id: pageId })
        console.log(`Deleted page: ${pageId}`)
    }

    // 3. ページをアップロード
    for (const note of notes) {
        try {
            await notion.pages.create({
                parent: {
                    database_id: databaseId,
                },
                properties: { // 更新対象のデータベースのカラムに合わせて変更
                    Name: {
                        type: 'title',
                        title: [{ text: { content: note.name } }],
                    },
                },
                children: note.body,
            })
        } catch (e) {
            console.error(`${note.name}の追加に失敗: `, e)
            failedNotes.push(note.name)
        }
    }

    console.log('ページ作成に失敗したノート: ', failedNotes)
}

main()
