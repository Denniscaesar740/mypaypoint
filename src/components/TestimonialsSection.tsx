import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Mensah',
      role: 'President, Engineering Society',
      university: 'University of Ghana',
      content: 'PayPoint transformed how we collect dues and event payments. What used to take weeks now happens in days. The analytics help us understand our members better.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Kwame Asante',
      role: 'Treasurer, Business Students Association',
      university: 'KNUST',
      content: 'The transparency and real-time tracking features are incredible. Our members love how easy it is to pay, and we love how easy it is to manage everything.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Ama Osei',
      role: 'Secretary, Medical Students Union',
      university: 'UCC',
      content: 'Setting up PayPoints for our events and merchandise sales has never been easier. The platform is intuitive and our members find it very convenient.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            What Student Leaders Say
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Trusted by student associations across Ghana's top universities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-8 relative">
              <Quote className="absolute top-6 right-6 h-8 w-8 text-indigo-200" />
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-semibold text-zinc-800">{testimonial.name}</h4>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <p className="text-sm text-indigo-600">{testimonial.university}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;