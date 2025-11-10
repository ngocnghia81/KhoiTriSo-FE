'use client';

import { MathMLRenderer } from '@/components/MathMLRenderer';

export function MathMLExample() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">MathML mfenced Conversion Example</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Before conversion:</h3>
          <div className="bg-gray-100 p-4 rounded">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <mfenced open="(" close=")">
                <mi>a</mi>
                <mo>+</mo>
                <mi>b</mi>
              </mfenced>
            </math>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">After conversion (automatic):</h3>
          <MathMLRenderer>
            <div className="bg-green-100 p-4 rounded">
              <math xmlns="http://www.w3.org/1998/Math/MathML">
                <mfenced open="(" close=")">
                  <mi>a</mi>
                  <mo>+</mo>
                  <mi>b</mi>
                </mfenced>
              </math>
            </div>
          </MathMLRenderer>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Complex example with separators:</h3>
          <MathMLRenderer>
            <div className="bg-blue-100 p-4 rounded">
              <math xmlns="http://www.w3.org/1998/Math/MathML">
                <mfenced open="[" close="]" separators=",">
                  <mi>x</mi>
                  <mi>y</mi>
                  <mi>z</mi>
                </mfenced>
              </math>
            </div>
          </MathMLRenderer>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Custom brackets:</h3>
          <MathMLRenderer>
            <div className="bg-purple-100 p-4 rounded">
              <math xmlns="http://www.w3.org/1998/Math/MathML">
                <mfenced open="{" close="}">
                  <mi>a</mi>
                  <mi>b</mi>
                  <mi>c</mi>
                </mfenced>
              </math>
            </div>
          </MathMLRenderer>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> The MathML mfenced conversion script is now globally available 
          and will automatically convert all mfenced elements on the page. The conversion 
          transforms mfenced elements into equivalent mrow structures with proper mo elements 
          for brackets and separators.
        </p>
      </div>
    </div>
  );
}
