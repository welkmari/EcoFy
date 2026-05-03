type LogoProps = {
  isCollapsed: boolean;
};

export default function Logo({ isCollapsed }: LogoProps) {
  return (
    <div className="flex items-center gap-2 group">
      <div className="relative w-9 h-9 flex items-end justify-center gap-[2px] p-[3px] rounded-lg bg-surface border border-border-default transition-all group-hover:border-border-active shrink-0">
        <div className="w-[6px] h-[50%] rounded-sm bg-linear-to-t from-purple-600 to-purple-500 transition-all group-hover:h-[55%]" />
        <div className="w-[6px] h-[75%] rounded-sm bg-linear-to-t from-purple-500 to-cyan-500 transition-all group-hover:h-[80%]" />
        <div className="w-[6px] h-full rounded-sm bg-linear-to-t from-cyan-500 to-cyan-400 transition-all group-hover:h-[105%]" />
        <div className="absolute top-[3px] left-[3px] right-[3px] h-[3px] bg-cyan-400 rounded-t-sm" />
        <div className="absolute bottom-[3px] left-[3px] right-[3px] h-[3px] bg-purple-600 rounded-b-sm" />
      </div>
      {!isCollapsed && (
        <span className="text-text-primary font-extrabold text-2xl tracking-tighter">
          Eco<span className="text-cyan-400">Fy</span>
        </span>
      )}
    </div>
  );
}
