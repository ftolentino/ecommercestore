import { useParams } from 'react-router-dom';

export function ProductDetailPage() {
  const { id } = useParams();

  return (
    <>
      <h1 className="text-balance">Product {id}</h1>
      <p className="text-secondary">
        The product detail view lands here in Phase 4, from <code>/products/{id}</code>.
      </p>
    </>
  );
}
