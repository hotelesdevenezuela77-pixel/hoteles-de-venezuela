import { useState, forwardRef } from 'react';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Label } from '@/react-app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/react-app/components/ui/select';
import { Calendar, User, Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { roomTypes } from '@/data/rooms';
import { Starfish, ShipWheel, TropicalFish, Seahorse } from './CaribbeanDecorations';

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
      
      // Format dates for display
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      };

      // Build WhatsApp message with reservation details
      const message = `🏖️ *SOLICITUD DE RESERVA - APARTO POSADA DEL MAR*

👤 *Nombre:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Teléfono:* ${formData.phone}

🛏️ *Tipo de Habitación:* ${formData.roomType || 'No seleccionado'}
📅 *Fecha de Entrada:* ${formatDate(formData.checkIn)}
📅 *Fecha de Salida:* ${formatDate(formData.checkOut)}

¡Hola! Me gustaría reservar una habitación. ¿Está disponible?`;

      // Register lead in CRM
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
      }).catch(() => {}); // Fire and forget

      // WhatsApp number (without + or spaces)
      const whatsappNumber = '584144815321';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      setIsSubmitted(true);
      setIsSubmitting(false);
    };

    // Update roomType when selectedRoomType prop changes
    useState(() => {
      if (selectedRoomType) {
        setFormData(prev => ({ ...prev, roomType: selectedRoomType }));
      }
    });

    if (isSubmitted) {
      return (
        <section ref={ref} id="reservar" className="py-20 relative overflow-hidden bg-white">
          <div className="max-w-2xl mx-auto px-4 relative z-10">
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl p-12 shadow-xl border border-cyan-100/50 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
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
                className="rounded-full"
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
        {/* Caribbean decorative elements - turquoise on white background */}
        <div className="absolute top-8 left-4 opacity-20 text-cyan-500 rotate-12">
          <Starfish className="w-16 h-16" />
        </div>
        <div className="absolute top-8 right-4 opacity-20 text-teal-500 -rotate-12">
          <ShipWheel className="w-20 h-20" />
        </div>
        <div className="absolute bottom-8 left-4 opacity-20 text-cyan-600 rotate-6">
          <TropicalFish className="w-14 h-14" />
        </div>
        <div className="absolute bottom-8 right-4 opacity-20 text-teal-400 -rotate-6">
          <Seahorse className="w-16 h-16" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-cyan-600 mb-2">
              <Starfish className="w-5 h-5" />
              <span className="text-sm font-medium tracking-widest uppercase">Reserve Su Estadía</span>
              <Starfish className="w-5 h-5 scale-x-[-1]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-foreground mt-3 mb-4">
              Comience su <span className="font-serif italic text-cyan-700">escapada</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Complete el formulario y nos pondremos en contacto para confirmar disponibilidad 
              y asegurar su reserva.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl p-8 md:p-10 shadow-xl border border-cyan-100/50">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-600" />
                  Nombre Completo
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                  className="rounded-xl border-border/50 focus:border-ocean"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-600" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@email.com"
                  required
                  className="rounded-xl border-border/50 focus:border-ocean"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-600" />
                  Teléfono / WhatsApp
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 123 456 7890"
                  required
                  className="rounded-xl border-border/50 focus:border-ocean"
                />
              </div>

              {/* Room Type */}
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-600" />
                  Tipo de Habitación
                </Label>
                <Select 
                  value={formData.roomType} 
                  onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                >
                  <SelectTrigger className="rounded-xl border-border/50">
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
                  className="rounded-xl border-border/50 focus:border-ocean"
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
                  className="rounded-xl border-border/50 focus:border-ocean"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full gradient-turquoise text-white text-lg py-6 rounded-full transition-all duration-300 hover:scale-[1.02] hover:opacity-90 disabled:opacity-50 border-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
