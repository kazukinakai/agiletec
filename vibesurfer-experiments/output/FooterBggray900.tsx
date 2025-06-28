interface Props {
  text: string;
}

export default function FooterBggray900(props: Props) {
  return (
    <footer className="bg-gray-900 text-white py-12">
<div className="container mx-auto px-4">
<div className="max-w-5xl mx-auto">
<div className="flex flex-col md:flex-row justify-between mb-8">
<div className="mb-8 md:mb-0">
<a href="#" className="mb-4 inline-block">
<img src="https://static.readdy.ai/image/c7c9bdc41c74bf89e533f3714821d6cf/45995fd6096ac772a0487f3f766caedc.png" alt="Agile Technology" className="h-10">
</a>
<p className="text-gray-400 max-w-xs">すべての企業に自社開発を。多重請負構造を撲滅し、企業のDX推進を支援します。</p>
</div>
<div className="grid grid-cols-2 md:grid-cols-3 gap-8">
<div>
<h3 className="font-bold mb-4">サービス</h3>
<ul className="space-y-2">
<li><a href="/corporate" className="text-gray-400 hover:text-white">法人向け</a></li>
<li><a href="/partner" className="text-gray-400 hover:text-white">パートナー様</a></li>
<li><a href="/individual" className="text-gray-400 hover:text-white">個人向け</a></li>
</ul>
</div>
<div>
<h3 className="font-bold mb-4">プロダクト</h3>
<ul className="space-y-2">
<li><a href="/products/airis" className="text-gray-400 hover:text-white">AIrisスイート</a></li>
<li><a href="/products/oss" className="text-gray-400 hover:text-white">OSS</a></li>
</ul>
</div>
<div>
<h3 className="font-bold mb-4">会社情報</h3>
<ul className="space-y-2">
<li><a href="/about" className="text-gray-400 hover:text-white">会社概要</a></li>
<li><a href="/news" className="text-gray-400 hover:text-white">ニュース</a></li>
<li><a href="/case-studies" className="text-gray-400 hover:text-white">導入事例</a></li>
</ul>
</div>
</div>
</div>
<div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
<div className="mb-4 md:mb-0">
<p className="text-gray-400 text-sm">
〒100-0001 東京都千代田区千代田1-1-1<br>
法人番号: 1234567890123
</p>
</div>
<div className="flex space-x-4">
<a href="/privacy" className="text-gray-400 hover:text-white text-sm">プライバシーポリシー</a>
<a href="/terms" className="text-gray-400 hover:text-white text-sm">利用規約</a>
</div>
</div>
<div className="mt-8 text-center text-gray-500 text-sm">
© 2025 株式会社アジャイルテクノロジー All Rights Reserved.
</div>
</div>
</div>
</footer>
  );
}