interface Props {
  text: string;
}

export default function SectionContact(props: Props) {
  return (
    <section id="contact" className="section-spacing relative">
<div className="container">
<div className="max-w-5xl mx-auto bg-gradient-to-br from-primary to-secondary rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
<div className="relative px-8 py-12 md:px-12">
<div className="relative text-center text-white">
<h2 className="text-3xl md:text-4xl font-bold mb-6">お問い合わせ</h2>
<p className="text-lg mb-8 leading-relaxed">
AIと自動化技術で、あなたのビジネスを次のステージへ。<br>
まずは資料をダウンロードいただくか、お気軽にご相談ください。
</p>
<div className="flex flex-col md:flex-row items-center justify-center gap-4">
<a href="https://slack.com/connect" target="_blank" className="flex items-center gap-2 bg-white text-[#4A154B] px-6 py-3 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap w-full md:w-auto justify-center border border-gray-200">
<div className="w-6 h-6 flex items-center justify-center">
<img src="https://static.readdy.ai/image/c7c9bdc41c74bf89e533f3714821d6cf/7d361d0b9fc170da09900710d60a093a.png" alt="Slack" className="w-full h-full">
</div>
<span className="font-medium">Slack で相談する</span>
</a>
<a href="https://line.me/R/ti/p/@your-line-id" target="_blank" className="flex items-center gap-2 bg-[#06C755] text-white px-6 py-3 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap w-full md:w-auto justify-center">
<div className="w-8 h-8 flex items-center justify-center">
<i className="ri-line-fill ri-2x"></i>
</div>
<span className="font-medium">LINE で相談する</span>
</a>
</div>
</div>
</div>
</div>
</div>
</section>
  );
}