interface Props {
  text: string;
}

export default function HeaderFixed(props: Props) {
  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md shadow-lg z-50">
<div className="container mx-auto px-6 py-4 flex items-center justify-between">
<a href="#" className="flex items-center gap-3">
<img src="https://static.readdy.ai/image/c7c9bdc41c74bf89e533f3714821d6cf/45995fd6096ac772a0487f3f766caedc.png" alt="Agile Technology" className="w-10 h-10">
<span className="text-xl font-medium">Agile Technology</span>
</a>
<nav className="hidden md:flex items-center gap-8">
<a href="#" className="text-gray-900 hover:text-primary">ホーム</a>
<a href="#" className="text-gray-900 hover:text-primary">私たちについて</a>
<a href="#" className="text-gray-900 hover:text-primary">サービス一覧</a>
<a href="#" className="text-gray-900 hover:text-primary">blog</a>
</nav>
<div className="hidden md:flex items-center gap-4">
<a href="https://slack.com/connect" target="_blank" className="cta-button cta-button-slack">
<div className="w-8 h-8 flex items-center justify-center">
<img src="https://static.readdy.ai/image/c7c9bdc41c74bf89e533f3714821d6cf/7d361d0b9fc170da09900710d60a093a.png" alt="Slack" className="w-full h-full">
</div>
<span className="font-medium">Slack で相談する</span>
</a>
<a href="https://line.me/R/ti/p/@your-line-id" target="_blank" className="cta-button cta-button-line">
<div className="w-8 h-8 flex items-center justify-center">
<i className="ri-line-fill ri-2x"></i>
</div>
<span className="font-medium">LINE で相談する</span>
</a>
</div>
<button className="md:hidden p-2 rounded-full hover:bg-gray-100" id="mobileMenuButton">
<div className="w-6 h-6 flex items-center justify-center">
<i className="ri-menu-line ri-lg"></i>
</div>
</button>
</div>
<div id="mobileMenu" className="hidden md:hidden bg-white border-t">
<nav className="container mx-auto px-6 py-4">
<div className="flex flex-col space-y-4">
<a href="#" className="text-gray-900 hover:text-primary">ホーム</a>
<a href="#" className="text-gray-900 hover:text-primary">私たちについて</a>
<a href="#" className="text-gray-900 hover:text-primary">サービス一覧</a>
<a href="#" className="text-gray-900 hover:text-primary">blog</a>
<a href="#contact" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap w-full justify-center">
<div className="w-5 h-5 flex items-center justify-center">
<i className="ri-mail-line"></i>
</div>
お問い合わせ
</a>
</div>
</nav>
</div>
</header>
  );
}