interface Props {
  text: string;
  images: string;
}

export default function SectionSectionspacing(props: Props) {
  return (
    <section className="section-spacing bg-gradient-to-b from-white to-gray-50">
<div className="container">
<div className="text-center mb-12">
<span className="text-primary font-medium text-3xl">Service</span>
<h2 className="text-4xl font-bold mt-2">サービス概要</h2>
</div>
<p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
AIエンジニアリングの力を、あらゆる形でお届けします。<br>
開発の依頼から、スキル習得まで、お客様のニーズに合わせて柔軟に対応します。
</p>
<!-- 開発・制作サービス -->
<div className="max-w-6xl mx-auto mb-16">
<div className="flex items-center gap-4 mb-8">
<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
<div className="w-6 h-6 flex items-center justify-center text-primary">
<i className="ri-code-box-line"></i>
</div>
</div>
<h3 className="text-2xl font-bold">開発・制作サービス</h3>
</div>
<div className="grid md:grid-cols-2 gap-6">
<div className="bg-white rounded-lg overflow-hidden card-shadow">
<div className="relative h-48 -mx-0 -mt-0 mb-6 overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=modern%20web%20development%20workspace%2C%20multiple%20screens%20showing%20website%20design%2C%20clean%20minimalist%20office%20environment%2C%20professional%20development%20tools%2C%20soft%20natural%20lighting&amp;width=600&amp;height=400&amp;seq=50&amp;orientation=landscape" alt="ウェブ制作" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">ウェブ制作</h4>
<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">5万円〜</span>
</div>
</div>
<div className="px-8 pb-8">
<p className="text-gray-600 mb-6">最新のAIツールを活用し、高品質なウェブサイトを短期間で制作。レスポンシブデザインとSEO対策を標準装備し、ビジネスの成長を支援します。</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>AIによる高速開発</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>SEO最適化</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>レスポンシブ対応</span>
</li>
</ul>
</div>
</div>
<div className="bg-white rounded-lg overflow-hidden card-shadow">
<div className="relative h-48 -mx-0 -mt-0 mb-6 overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=enterprise%20system%20development%2C%20modern%20data%20center%2C%20server%20room%20with%20blue%20lighting%2C%20professional%20IT%20infrastructure%2C%20clean%20technical%20environment&amp;width=600&amp;height=400&amp;seq=51&amp;orientation=landscape" alt="システム制作" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">システム制作</h4>
<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">30万円〜</span>
</div>
</div>
<div className="px-8 pb-8">
<p className="text-gray-600 mb-6">業務効率化から基幹システムまで、幅広いニーズに対応。クラウドネイティブな設計で、スケーラブルなシステムを構築します。</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>クラウドネイティブ</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>高セキュリティ</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>スケーラブル設計</span>
</li>
</ul>
</div>
</div>
<div className="bg-white rounded-lg overflow-hidden card-shadow">
<div className="relative h-48 -mx-0 -mt-0 mb-6 overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=MVP%20development%20process%2C%20agile%20development%20team%2C%20modern%20startup%20environment%2C%20product%20design%20workshop%2C%20minimalist%20creative%20space&amp;width=600&amp;height=400&amp;seq=52&amp;orientation=landscape" alt="MVP制作" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">MVP制作</h4>
<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">50万円〜</span>
</div>
</div>
<div className="px-8 pb-8">
<p className="text-gray-600 mb-6">最小限の機能で市場価値を検証、スピーディーな開発を実現。アジャイル開発手法で、市場のニーズに柔軟に対応します。</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>迅速な市場投入</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>アジャイル開発</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>フィードバック重視</span>
</li>
</ul>
</div>
</div>
<div className="bg-white rounded-lg overflow-hidden card-shadow">
<div className="relative h-48 -mx-0 -mt-0 mb-6 overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=in-house%20development%20support%2C%20professional%20team%20collaboration%2C%20modern%20tech%20office%2C%20knowledge%20sharing%20session%2C%20clean%20corporate%20environment&amp;width=600&amp;height=400&amp;seq=53&amp;orientation=landscape" alt="自社開発支援" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">自社開発支援</h4>
<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">要相談</span>
</div>
</div>
<div className="px-8 pb-8">
<p className="text-gray-600 mb-6">社内人材の育成からAI活用まで、包括的にサポート。技術力の内製化を実現し、持続的な成長を支援します。</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>人材育成支援</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>技術移転</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<span>継続的サポート</span>
</li>
</ul>
</div>
</div>
</div>
</div>
<!-- コンサルティング -->
<div className="max-w-6xl mx-auto mb-16">
<div className="flex items-center gap-4 mb-8">
<div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
<div className="w-6 h-6 flex items-center justify-center text-secondary">
<i className="ri-lightbulb-line"></i>
</div>
</div>
<h3 className="text-2xl font-bold">コンサルティング</h3>
</div>
<div className="grid md:grid-cols-2 gap-6">
<div className="bg-white rounded-lg overflow-hidden card-shadow">
<div className="relative h-48 -mx-0 -mt-0 mb-6 overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=cloud%20CTO%20consulting%2C%20executive%20meeting%20in%20modern%20office%2C%20strategic%20planning%20session%2C%20professional%20business%20environment%2C%20minimalist%20corporate%20setting&amp;width=600&amp;height=400&amp;seq=54&amp;orientation=landscape" alt="クラウドCTO" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">クラウドCTO</h4>
<span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">月30万円〜</span>
</div>
</div>
<div className="px-8 pb-8">
<p className="text-gray-600 mb-6">技術戦略の策定から、開発体制の構築までサポート。経験豊富なCTOが御社の技術部門を強力にバックアップします。</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>技術戦略立案</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>アーキテクチャ設計</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>技術選定支援</span>
</li>
</ul>
</div>
</div>
<div className="bg-white rounded-lg overflow-hidden card-shadow">
<div className="relative h-48 -mx-0 -mt-0 mb-6 overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=digital%20transformation%20consulting%2C%20modern%20business%20strategy%20meeting%2C%20innovation%20workshop%2C%20professional%20team%20collaboration%2C%20clean%20corporate%20environment&amp;width=600&amp;height=400&amp;seq=55&amp;orientation=landscape" alt="DXコンサルティング" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">DXコンサルティング</h4>
<span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">月100万円〜</span>
</div>
</div>
<div className="px-8 pb-8">
<p className="text-gray-600 mb-6">デジタル変革の戦略立案から実装まで支援。企業のDXを成功に導く包括的なコンサルティングを提供します。</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>DX戦略策定</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>業務改革支援</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>変革管理</span>
</li>
</ul>
</div>
</div>
<div className="bg-white rounded-lg overflow-hidden card-shadow">
<div className="relative h-48 -mx-0 -mt-0 mb-6 overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=agile%20development%20implementation%2C%20scrum%20team%20meeting%2C%20kanban%20board%20discussion%2C%20modern%20agile%20workspace%2C%20minimalist%20office%20setting&amp;width=600&amp;height=400&amp;seq=56&amp;orientation=landscape" alt="アジャイル開発導入" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">アジャイル開発導入</h4>
<span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">月200万円〜</span>
</div>
</div>
<div className="px-8 pb-8">
<p className="text-gray-600 mb-6">スクラム手法の導入から定着まで、実践的にサポート。アジャイル開発の文化を組織に根付かせます。</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>スクラム導入</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>チーム育成</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>プロセス最適化</span>
</li>
</ul>
</div>
</div>
<div className="bg-white rounded-lg overflow-hidden card-shadow">
<div className="relative h-48 -mx-0 -mt-0 mb-6 overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=project%20management%20consulting%2C%20professional%20team%20planning%20session%2C%20modern%20project%20workspace%2C%20strategic%20meeting%20room%2C%20clean%20corporate%20environment&amp;width=600&amp;height=400&amp;seq=57&amp;orientation=landscape" alt="プロジェクト推進" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">プロジェクト推進</h4>
<span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">月300万円〜</span>
</div>
</div>
<div className="px-8 pb-8">
<p className="text-gray-600 mb-6">開発プロジェクトの立ち上げから運用まで一貫支援。プロジェクトの成功をトータルでサポートします。</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>PMO支援</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>品質管理</span>
</li>
<li className="flex items-center gap-2 text-gray-600">
<div className="w-5 h-5 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<span>リスク管理</span>
</li>
</ul>
</div>
</div>
</div>
</div>
<!-- AI駆動開発スクール -->
<div className="max-w-6xl mx-auto mb-16">
<div className="flex items-center gap-4 mb-8">
<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
<div className="w-6 h-6 flex items-center justify-center text-blue-600">
<i className="ri-robot-line"></i>
</div>
</div>
<h3 className="text-2xl font-bold">AI駆動開発スクール</h3>
</div>
<div className="grid md:grid-cols-2 gap-6">
<div className="bg-white rounded-lg p-8 card-shadow">
<div className="relative h-48 -mx-8 -mt-8 mb-6 rounded-t-lg overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=young%20professional%20learning%20AI%20development%2C%20focused%20individual%20working%20with%20multiple%20screens%2C%20modern%20workspace%2C%20clean%20minimalist%20environment%2C%20soft%20natural%20lighting%2C%20career%20transition%20visualization&amp;width=600&amp;height=400&amp;seq=45&amp;orientation=landscape" alt="個人向けAI開発スクール" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">個人向け</h4>
<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">月5万円</span>
</div>
</div>
<ul className="space-y-4 mb-6">
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">営業→CTOへの完全ロードマップ</p>
<p className="text-sm text-gray-600">実践的なキャリアパスを提供</p>
</div>
</li>
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">最新AIコーディングツール実践</p>
<p className="text-sm text-gray-600">Cursor、Windなど実践的なツール活用</p>
</div>
</li>
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-primary">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">MCPサーバー連携・自動化</p>
<p className="text-sm text-gray-600">実務で使える技術を習得</p>
</div>
</li>
</ul>
<div className="bg-blue-50 rounded-lg p-4">
<p className="text-sm text-blue-800">
<i className="ri-information-line mr-2"></i>
未経験からでも3ヶ月で即戦力に
</p>
</div>
<div className="mt-4 text-right">
<a href="https://dev.agiletec.net/ai-study-school" data-readdy="true" className="text-secondary hover:underline text-sm">詳細をみる →</a>
</div>
</div>
<div className="bg-white rounded-lg p-8 card-shadow">
<div className="relative h-48 -mx-8 -mt-8 mb-6 rounded-t-lg overflow-hidden">
<img src="https://readdy.ai/api/search-image?query=corporate%20team%20learning%20AI%20development%2C%20diverse%20group%20in%20modern%20training%20room%2C%20professional%20business%20environment%2C%20collaborative%20workspace%2C%20enterprise%20level%20training%20visualization%2C%20clean%20minimalist%20setting&amp;width=600&amp;height=400&amp;seq=46&amp;orientation=landscape" alt="法人向けAI開発研修" className="w-full h-full object-cover">
<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
<div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
<h4 className="text-xl font-bold text-gray-900">法人向け研修</h4>
<span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">リスキリング補助金対応</span>
</div>
</div>
<ul className="space-y-4 mb-6">
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">企業内AI開発人材育成</p>
<p className="text-sm text-gray-600">御社に最適化したカリキュラム</p>
</div>
</li>
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">実践的なハンズオン研修</p>
<p className="text-sm text-gray-600">現場で即活用できるスキル習得</p>
</div>
</li>
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-secondary">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">継続的なサポート体制</p>
<p className="text-sm text-gray-600">研修後もしっかりフォロー</p>
</div>
</li>
</ul>
<div className="bg-green-50 rounded-lg p-4">
<p className="text-sm text-green-800">
<i className="ri-information-line mr-2"></i>
最大70%の補助金が利用可能
</p>
</div>
<div className="mt-4 text-right">
<a href="https://dev.agiletec.net/ai-study-school" data-readdy="true" className="text-secondary hover:underline text-sm">詳細をみる →</a>
</div>
</div>
</div>
</div>
<!-- パートナー連携 -->
<div className="max-w-6xl mx-auto">
<div className="flex items-center gap-4 mb-8">
<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
<div className="w-6 h-6 flex items-center justify-center text-purple-600">
<i className="ri-hand-heart-line"></i>
</div>
</div>
<h3 className="text-2xl font-bold">パートナー連携</h3>
</div>
<div className="bg-white rounded-lg p-8 card-shadow">
<div className="grid md:grid-cols-2 gap-12">
<div>
<h4 className="text-xl font-bold mb-6">SES・エージェント向けサービス</h4>
<ul className="space-y-4 mb-8">
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-purple-600">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">柔軟な協業体制</p>
<p className="text-sm text-gray-600">1人法人だからこそ実現できる機動的な対応</p>
</div>
</li>
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-purple-600">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">技術支援・ナレッジ共有</p>
<p className="text-sm text-gray-600">最新AI技術の導入支援と知見の共有</p>
</div>
</li>
<li className="flex items-start gap-3">
<div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center text-purple-600">
<i className="ri-check-line"></i>
</div>
<div>
<p className="font-medium">プロジェクト単位での協業</p>
<p className="text-sm text-gray-600">必要な時に必要なだけ連携可能</p>
</div>
</li>
</ul>
<a href="https://slack.com/connect" target="_blank" className="flex items-center gap-2 bg-white text-[#4A154B] px-8 py-4 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap group w-full sm:w-auto justify-center border border-gray-200 mb-4">
<div className="w-6 h-6 flex items-center justify-center">
<img src="https://static.readdy.ai/image/c7c9bdc41c74bf89e533f3714821d6cf/7d361d0b9fc170da09900710d60a093a.png" alt="Slack" className="w-full h-full">
</div>
<span className="font-medium">Slack で相談する</span>
<div className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<i className="ri-external-link-line"></i>
</div>
</a>
<p className="text-sm text-gray-600">SESエージェントの会社様とのやりとりは、すべてSlackでお願いしています。</p>
</div>
<div className="relative">
<img src="https://readdy.ai/api/search-image?query=professional%20business%20handshake%2C%20diverse%20team%20collaboration%2C%20partnership%20meeting%20in%20modern%20conference%20room%2C%20warm%20lighting%2C%20trust%20and%20cooperation%2C%20minimalist%20corporate%20environment&amp;width=600&amp;height=400&amp;seq=12&amp;orientation=landscape" alt="Partnership" className="rounded-lg shadow-lg">
<div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
<p className="text-sm font-medium text-purple-600">
<i className="ri-shield-check-line mr-1"></i>
信頼できるパートナーシップ
</p>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
  );
}