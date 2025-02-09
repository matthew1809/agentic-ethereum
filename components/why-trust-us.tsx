'use client'
import { CircleDollarSign, ShieldCheck, LineChart } from 'lucide-react'

export default function WhyTrustUs() {
  const features = [
    {
      icon: <CircleDollarSign className="h-8 w-8 text-amber-500" />,
      title: "AI ensures funds go where they're needed most",
      description: "AI analyzes shelter needs in real time to prevent misuse and overfunding."
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-amber-500" />,
      title: "Zero-Knowledge Proofs protect sensitive data",
      description: "Shelters can prove financial need without exposing private data, ensuring fair funding distribution."
    },
    {
      icon: <LineChart className="h-8 w-8 text-amber-500" />,
      title: "Smart contracts lock & track every donation",
      description: "Trust, but verify—shelters get exactly what they need, no more, no less."
    }
  ];

  return (
    <div className="bg-[#fef3e3] py-24 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Why trust us? AI + Web3 ensures fairness
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Smart donations, zero fraud, full transparency.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg p-8 border border-gray-200">
              {feature.icon}
              <h3 className="text-xl font-semibold mt-4 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 