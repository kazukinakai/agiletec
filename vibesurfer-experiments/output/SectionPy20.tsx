interface Props {
  text: string;
}

export default function SectionPy20(props: Props) {
  return (
    <section className="py-20">
<div className="container mx-auto px-4">
<div className="text-center mb-12">
<span className="text-primary font-medium text-3xl">News</span>
<h2 className="text-4xl font-bold mt-2">ニュース</h2>
</div>
<div className="max-w-3xl mx-auto">
<ul className="divide-y divide-gray-200">
<li className="py-4">
<div className="flex flex-col sm:flex-row sm:items-center">
<span className="text-sm text-gray-500 sm:w-32 flex-shrink-0">2025-06-15</span>
<a href="#" className="mt-1 sm:mt-0 hover:text-secondary">
<h3 className="font-medium">AI電話秘書の新機能「感情分析」をリリース</h3>
</a>
</div>
</li>
<li className="py-4">
<div className="flex flex-col sm:flex-row sm:items-center">
<span className="text-sm text-gray-500 sm:w-32 flex-shrink-0">2025-05-28</span>
<a href="#" className="mt-1 sm:mt-0 hover:text-secondary">
<h3 className="font-medium">「AI駆動開発スクール」第3期生募集開始</h3>
</a>
</div>
</li>
<li className="py-4">
<div className="flex flex-col sm:flex-row sm:items-center">
<span className="text-sm text-gray-500 sm:w-32 flex-shrink-0">2025-05-10</span>
<a href="#" className="mt-1 sm:mt-0 hover:text-secondary">
<h3 className="font-medium">「Financial Intelligence」が日経FinTech大賞を受賞</h3>
</a>
</div>
</li>
</ul>
<div className="mt-8 text-center">
<a href="/news" className="inline-block text-secondary font-medium hover:underline">
すべてのニュースを見る
<div className="w-5 h-5 ml-1 inline-flex items-center justify-center">
<i className="ri-arrow-right-line"></i>
</div>
</a>
</div>
</div>
</div>
</section>
  );
}