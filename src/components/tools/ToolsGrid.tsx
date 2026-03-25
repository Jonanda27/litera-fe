// litera/src/components/tools/ToolsGrid.tsx
import Link from 'next/link';
import ToolCard from './ToolCard';

const toolItems = [
  { id: 1, label: 'JURNAL', color: 'bg-red-500', img: 'https://cdn-icons-png.flaticon.com/512/3389/3389032.png', path: '/peserta/tools/jurnal' },
  { id: 2, label: 'TEMPLATE', color: 'bg-blue-500', img: 'https://cdn-icons-png.flaticon.com/512/1001/1001371.png', path: '/peserta/tools/template' },
  { id: 3, label: 'ARSIP', color: 'bg-green-500', img: 'https://cdn-icons-png.flaticon.com/512/3532/3532353.png', path: '#' },
  { id: 4, label: 'PORTOFOLIO', color: 'bg-lime-500', img: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png', path: '#' },
  { id: 5, label: 'KARYA', color: 'bg-purple-500', img: 'https://cdn-icons-png.flaticon.com/512/1048/1048944.png', path: '#' },
  { id: 6, label: 'GRAMMAR', color: 'bg-orange-500', img: 'https://cdn-icons-png.flaticon.com/512/2545/2545814.png', path: '/peserta/tools/grammar' }, // <-- Tool Grammar Baru
];

export default function ToolsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-6 items-center justify-items-center">
      {toolItems.map((item) => (
        <Link href={item.path || '#'} key={item.id} className="block w-full">
          <ToolCard 
            label={item.label}
            color={item.color}
            image={item.img}
          />
        </Link>
      ))}
    </div>
  );
}