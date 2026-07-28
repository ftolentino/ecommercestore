// Ply only styles form controls properly inside a `.form` wrapper.
export function CategoryFilter({ categories, value, onChange, disabled }) {
  return (
    <div className="form">
      <label htmlFor="category-filter">Category</label>
      <select
        id="category-filter"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
