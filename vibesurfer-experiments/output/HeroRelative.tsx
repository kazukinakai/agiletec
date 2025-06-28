interface Props {
  text: string;
}

export default function HeroRelative(props: Props) {
  return (
    <section className="relative min-h-[100svh] sm:min-h-screen flex items-start sm:items-center overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('https://static.readdy.ai/image/c7c9bdc41c74bf89e533f3714821d6cf/f5ab4ce1cb70e3e70fe158903102adf3.webp'); z-index: -1;"></div>
<div className="container mx-auto px-6 pt-20 sm:pt-32 sm:py-24 md:py-32 relative z-20">
<div className="max-w-3xl bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-12 card-shadow">
<div className="flex items-center gap-3 mb-6">
<span className="text-primary font-medium text-3xl">Our Vision</span>
</div>
<h1 className="text-4xl md:text-6xl font-bold mb-8 text-gray-900 leading-tight">すべての企業に<br>自社開発</h1>
<p className="text-lg text-gray-700 max-w-2xl mb-12">私たちアジャイルテクノロジーは「すべての企業に自社開発」をビジョンに、全てのお客様の課題ごとに最適解を共に考え、柔軟かつ低コストでのDXを伴走型で実現するプロフェッショナルカンパニーです。</p>
<p className="text-lg mb-10 max-w-2xl mx-auto text-gray-600 leading-relaxed"></p>
<div className="flex flex-wrap gap-4">
<a href="https://slack.com/connect" target="_blank" className="flex items-center gap-2 bg-white text-[#4A154B] px-8 py-4 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap text-lg border border-gray-200">
<div className="w-6 h-6 flex items-center justify-center">
<img src="https://static.readdy.ai/image/c7c9bdc41c74bf89e533f3714821d6cf/7d361d0b9fc170da09900710d60a093a.png" alt="Slack" className="w-full h-full">
</div>
<span className="font-medium">Slack で相談する</span>
</a>
<a href="https://line.me/R/ti/p/@your-line-id" target="_blank" className="flex items-center gap-2 bg-[#06C755] text-white px-8 py-4 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap text-lg">
<div className="w-8 h-8 flex items-center justify-center">
<i className="ri-line-fill ri-2x"></i>
</div>
<span className="font-medium">LINE で相談する</span>
</a>
</div>
</div>
</div>
</section>
  );
}