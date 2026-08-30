import { useState, forwardRef } from 'react';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Label } from '@/react-app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/react-app/components/ui/select';
import { Calendar, User, Mail, Phone, Send, CheckCircle, Sparkles } from 'lucide-react';
import { roomTypes } from '@/data/rooms';

interface BookingFormProps {
  selectedRoomType?: string;
}

export const BookingForm = forwardRef<HTMLDivElement, BookingFormProps>(
  function BookingForm({ selectedRoomType }, ref) {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      roomType: selectedRoomType || '',
      guests: '2',
      message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      };

      const message = `🏨 *SOLICITUD DE RESERVA - POSADA PERLA NEGRA*

👤 *Nombre:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Teléfono:* ${formData.phone}

🛏️ *Tipo de Habitación:* ${formData.roomType || 'No seleccionado'}
📅 *Fecha de Entrada:* ${formatDate(formData.checkIn)}
📅 *Fecha de Salida:* ${formatDate(formData.checkOut)}

¡Hola! Me gustaría reservar una habitación. ¿Está disponible?`;

      fetch('/api/leads/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source: 'Formulario de Reserva',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          room_type: formData.roomType,
          check_in: formData.checkIn,
          check_out: formData.checkOut
        })
      }).catch(() => {});

      const whatsappNumber = '584244242766';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      setIsSubmitted(true);
      setIsSubmitting(false);
    };

    useState(() => {
      if (selectedRoomType) {
        setFormData(prev => ({ ...prev, roomType: selectedRoomType }));
      }
    });

    if (isSubmitted) {
      return (
        <section ref={ref} id="reservar" className="py-20 relative overflow-hidden bg-white">
          <div className="max-w-2xl mx-auto px-4 relative z-10">
            <div className="bg-stone-50 border border-stone-200 p-12 shadow-xl text-center">
              <div className="w-20 h-20 gradient-gold flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-stone-900" />
              </div>
              <h3 className="text-3xl font-light text-foreground mb-4">
                ¡Mensaje enviado a WhatsApp!
              </h3>
              <p className="text-muted-foreground text-lg mb-6">
                Se ha abierto WhatsApp con su solicitud de reserva. 
                Envíe el mensaje y nuestro equipo le responderá pronto para confirmar disponibilidad.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                Enviar otra solicitud
              </Button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section ref={ref} id="reservar" className="py-20 relative overflow-hidden bg-white">
        {/* Decorative corner accents */}
        <div className="absolute top-12 left-8 w-24 h-24 border-l border-t border-amber-400/30" />
        <div className="absolute top-12 right-8 w-24 h-24 border-r border-t border-amber-400/30" />
        <div className="absolute bottom-12 left-8 w-24 h-24 border-l border-b border-amber-400/30" />
        <div className="absolute bottom-12 right-8 w-24 h-24 border-r border-b border-amber-400/30" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-amber-500 mb-2">
              <div className="h-px w-8 bg-amber-400" />
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium tracking-[0.2em] uppercase">Reserve Su Estadía</span>
              <Sparkles className="w-4 h-4" />
              <div className="h-px w-8 bg-amber-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-foreground mt-3 mb-4">
              Comience su <span className="font-serif italic gradient-text-gold">escapada</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Complete el formulario y nos pondremos en contacto para confirmar disponibilidad 
              y asegurar su reserva.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-stone-50 border border-stone-200 p-8 md:p-10 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  Nombre Completo
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                  className="border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@email.com"
                  required
                  className="border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500" />
                  Teléfono / WhatsApp
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+58 414 123 4567"
                  required
                  className="border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              {/* Room Type */}
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Tipo de Habitación
                </Label>
                <Select 
                  value={formData.roomType} 
                  onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                >
                  <SelectTrigger className="border-stone-300 focus:border-amber-500">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((room) => (
                      <SelectItem key={room.type} value={room.type}>
                        {room.type} - Hasta {room.capacity} personas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in */}
              <div className="space-y-2">
                <Label htmlFor="checkIn" className="text-foreground">
                  Fecha de Entrada
                </Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <Label htmlFor="checkOut" className="text-foreground">
                  Fecha de Salida
                </Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  required
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  className="border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full gradient-gold text-stone-900 font-semibold text-lg py-6 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 border-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Reservar por WhatsApp
                  </span>
                )}
              </Button>
              <p className="text-center text-muted-foreground text-sm mt-4">
                Se abrirá WhatsApp con los datos de su reserva para contactar directamente.
              </p>
            </div>
          </form>
        </div>
      </section>
    );
  }
);
