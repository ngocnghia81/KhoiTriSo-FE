'use client';

import { LatexRenderer } from '@/components/LatexRenderer';

export function LatexRendererTest() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">LatexRenderer Test</h3>
      
      <div className="space-y-2">
        <div>
          <h4 className="font-medium">Normal content:</h4>
          <LatexRenderer content="This is a normal text with $x^2$ math" />
        </div>
        
        <div>
          <h4 className="font-medium">Empty string:</h4>
          <LatexRenderer content="" />
        </div>
        
        <div>
          <h4 className="font-medium">Undefined content (should not crash):</h4>
          <LatexRenderer content={undefined} />
        </div>
        
        <div>
          <h4 className="font-medium">Null content (should not crash):</h4>
          <LatexRenderer content={null} />
        </div>
        
        <div>
          <h4 className="font-medium">Math expressions:</h4>
          <LatexRenderer content="The formula is $E = mc^2$ and also $\frac{a}{b}$" />
        </div>
      </div>
    </div>
  );
}
