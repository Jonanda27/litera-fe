import ToolCard from './ToolCard';

const toolItems = [
  { id: 1, label: 'JURNAL', color: 'bg-red-500', img: 'https://cdn-icons-png.flaticon.com/512/3389/3389032.png' },
  { id: 2, label: 'TEMPLATE', color: 'bg-blue-500', img: 'https://cdn-icons-png.flaticon.com/512/1001/1001371.png' },
  { id: 3, label: 'ARSIP', color: 'bg-green-500', img: 'https://cdn-icons-png.flaticon.com/512/3532/3532353.png' },
  { id: 4, label: 'PORTOFOLIO', color: 'bg-lime-500', img: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' },
  { id: 5, label: 'KARYA', color: 'bg-purple-500', img: 'https://cdn-icons-png.flaticon.com/512/1048/1048944.png' },
];

export default function ToolsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-6 items-center justify-items-center">
      {toolItems.map((item) => (
        <ToolCard 
          key={item.id}
          label={item.label}
          color={item.color}
          image={item.img}
        />
      ))}
    </div>
  );
}