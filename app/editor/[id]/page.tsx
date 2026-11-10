import EditorClient from '@/components/EditorClient'

export const instant = false

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditorClient id={id} />
}
