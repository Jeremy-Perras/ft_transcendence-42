export const Highlight = ({
  content,
  searchInput,
}: {
  content: string;
  searchInput: string;
}) => {
  const index = content.toLowerCase().indexOf(searchInput.toLowerCase());
  const before = content.slice(0, index);
  const match = content.slice(index, index + searchInput.length);
  const after = content.slice(index + searchInput.length);

  return (
    <span className="ml-2">
      <span>{before}</span>
      <span className="bg-amber-300">{match}</span>
      <span>{after}</span>
    </span>
  );
};
