type PostSummaryProps = {
  title: string
  tag: string
}

export function PostSummary({ title, tag }: PostSummaryProps) {
  return (
    <article>
      <h3>{title}</h3>
      <small>{tag}</small>
    </article>
  )
}
