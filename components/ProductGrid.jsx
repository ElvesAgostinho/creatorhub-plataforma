import ProductCard from "./ProductCard"

export default function ProductGrid({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-neutral-500">Sem itens disponíveis.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map(item => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  )
}
