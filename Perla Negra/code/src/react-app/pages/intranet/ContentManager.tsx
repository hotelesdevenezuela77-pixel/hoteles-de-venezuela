import { useState, useEffect, useRef } from 'react';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Save, Image, Type, RefreshCw, ChevronDown, ChevronUp, Upload, Loader2, X, Plus } from 'lucide-react';

interface ContentItem {
  id: number;
  section: string;
  content_key: string;
  content_value: string;
  content_type: string;
}

export default function ContentManager() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    banner: true,
    rooms: true,
    rooms_display: true,
    facilities: true
  });
  const [editedContent, setEditedContent] = useState<Record<number, string>>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadingGalleryId, setUploadingGalleryId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<number | null>(null);
  const galleryTargetId = useRef<number | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/site-content');
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (id: number, value: string) => {
    setEditedContent(prev => ({ ...prev, [id]: value }));
  };

  const handleUploadClick = (id: number) => {
    uploadTargetId.current = id;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = uploadTargetId.current;
    
    if (!file || !targetId) return;

    setUploadingId(targetId);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        // Update the content with the new image URL
        handleContentChange(targetId, data.url);
        // Auto-save
        await fetch(`/api/site-content/${targetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_value: data.url })
        });
        // Refresh content
        await fetchContent();
        setEditedContent(prev => {
          const newEdited = { ...prev };
          delete newEdited[targetId];
          return newEdited;
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir imagen');
    } finally {
      setUploadingId(null);
      uploadTargetId.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGalleryUploadClick = (id: number) => {
    galleryTargetId.current = id;
    galleryInputRef.current?.click();
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = galleryTargetId.current;
    
    if (!file || !targetId) return;

    setUploadingGalleryId(targetId);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        // Get current images array
        const item = content.find(c => c.id === targetId);
        let currentImages: string[] = [];
        try {
          const currentValue = editedContent[targetId] ?? item?.content_value ?? '[]';
          currentImages = JSON.parse(currentValue);
        } catch {
          currentImages = [];
        }
        // Add new image
        currentImages.push(data.url);
        const newValue = JSON.stringify(currentImages);
        
        // Auto-save
        await fetch(`/api/site-content/${targetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_value: newValue })
        });
        // Refresh content
        await fetchContent();
        setEditedContent(prev => {
          const newEdited = { ...prev };
          delete newEdited[targetId];
          return newEdited;
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir imagen');
    } finally {
      setUploadingGalleryId(null);
      galleryTargetId.current = null;
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const removeGalleryImage = async (itemId: number, imageIndex: number) => {
    const item = content.find(c => c.id === itemId);
    if (!item) return;

    try {
      const currentValue = editedContent[itemId] ?? item.content_value ?? '[]';
      let images: string[] = JSON.parse(currentValue);
      images = images.filter((_, i) => i !== imageIndex);
      const newValue = JSON.stringify(images);

      // Auto-save
      await fetch(`/api/site-content/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_value: newValue })
      });
      // Refresh content
      await fetchContent();
      setEditedContent(prev => {
        const newEdited = { ...prev };
        delete newEdited[itemId];
        return newEdited;
      });
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const saveContent = async (item: ContentItem) => {
    const newValue = editedContent[item.id];
    if (newValue === undefined || newValue === item.content_value) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/site-content/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_value: newValue })
      });
      if (res.ok) {
        setContent(prev => prev.map(c => 
          c.id === item.id ? { ...c, content_value: newValue } : c
        ));
        setEditedContent(prev => {
          const newEdited = { ...prev };
          delete newEdited[item.id];
          return newEdited;
        });
      }
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      for (const [idStr, value] of Object.entries(editedContent)) {
        const id = parseInt(idStr);
        await fetch(`/api/site-content/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_value: value })
        });
      }
      await fetchContent();
      setEditedContent({});
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getSectionConfig = (section: string): { title: string; description: string } => {
    const configs: Record<string, { title: string; description: string }> = {
      banner: { title: 'Banner Principal', description: 'Imagen y textos del hero en la página de inicio' },
      rooms: { title: 'Sección de Habitaciones', description: 'Títulos de la sección "Encuentre su Refugio Perfecto"' },
      rooms_display: { title: 'Habitaciones (8 Tarjetas)', description: 'Foto, nombre, descripción y capacidad de cada habitación mostrada en la página' },
      facilities: { title: 'Nuestras Instalaciones', description: 'Fotos y descripciones de las instalaciones' }
    };
    return configs[section] || { title: section, description: '' };
  };

  const getKeyLabel = (key: string): string => {
    const labels: Record<string, string> = {
      image_url: 'URL de la Imagen',
      title: 'Título',
      subtitle: 'Subtítulo',
      highlight_text: 'Texto Destacado',
      section_title: 'Título de la Sección',
      section_subtitle: 'Subtítulo de la Sección',
      familiar: 'Habitación Familiar (4 personas)',
      familiar_grande: 'Habitación Familiar Grande (6 personas)',
      extrafamiliar: 'Habitación Extrafamiliar (8 personas)',
      ejecutiva: 'Habitación Ejecutiva (2 personas)',
      // Room display labels (8 rooms)
      room_1_image: '🏠 Habitación 1 - Foto',
      room_1_title: '🏠 Habitación 1 - Nombre',
      room_1_description: '🏠 Habitación 1 - Descripción',
      room_1_capacity: '🏠 Habitación 1 - Capacidad (personas)',
      room_2_image: '🏠 Habitación 2 - Foto',
      room_2_title: '🏠 Habitación 2 - Nombre',
      room_2_description: '🏠 Habitación 2 - Descripción',
      room_2_capacity: '🏠 Habitación 2 - Capacidad (personas)',
      room_3_image: '🏠 Habitación 3 - Foto',
      room_3_title: '🏠 Habitación 3 - Nombre',
      room_3_description: '🏠 Habitación 3 - Descripción',
      room_3_capacity: '🏠 Habitación 3 - Capacidad (personas)',
      room_4_image: '🏠 Habitación 4 - Foto',
      room_4_title: '🏠 Habitación 4 - Nombre',
      room_4_description: '🏠 Habitación 4 - Descripción',
      room_4_capacity: '🏠 Habitación 4 - Capacidad (personas)',
      room_5_image: '🏠 Habitación 5 - Foto',
      room_5_title: '🏠 Habitación 5 - Nombre',
      room_5_description: '🏠 Habitación 5 - Descripción',
      room_5_capacity: '🏠 Habitación 5 - Capacidad (personas)',
      room_6_image: '🏠 Habitación 6 - Foto',
      room_6_title: '🏠 Habitación 6 - Nombre',
      room_6_description: '🏠 Habitación 6 - Descripción',
      room_6_capacity: '🏠 Habitación 6 - Capacidad (personas)',
      room_7_image: '🏠 Habitación 7 - Foto',
      room_7_title: '🏠 Habitación 7 - Nombre',
      room_7_description: '🏠 Habitación 7 - Descripción',
      room_7_capacity: '🏠 Habitación 7 - Capacidad (personas)',
      room_8_image: '🏠 Habitación 8 - Foto',
      room_8_title: '🏠 Habitación 8 - Nombre',
      room_8_description: '🏠 Habitación 8 - Descripción',
      room_8_capacity: '🏠 Habitación 8 - Capacidad (personas)',
      // Room gallery images
      room_1_images: '📷 Habitación 1 - Galería de Fotos',
      room_2_images: '📷 Habitación 2 - Galería de Fotos',
      room_3_images: '📷 Habitación 3 - Galería de Fotos',
      room_4_images: '📷 Habitación 4 - Galería de Fotos',
      room_5_images: '📷 Habitación 5 - Galería de Fotos',
      room_6_images: '📷 Habitación 6 - Galería de Fotos',
      room_7_images: '📷 Habitación 7 - Galería de Fotos',
      room_8_images: '📷 Habitación 8 - Galería de Fotos',
      // Facilities labels
      facility_1_image: 'Foto Instalación 1',
      facility_1_title: 'Título Instalación 1',
      facility_1_description: 'Descripción Instalación 1',
      facility_2_image: 'Foto Instalación 2',
      facility_2_title: 'Título Instalación 2',
      facility_2_description: 'Descripción Instalación 2',
      facility_3_image: 'Foto Instalación 3',
      facility_3_title: 'Título Instalación 3',
      facility_3_description: 'Descripción Instalación 3',
      facility_4_image: 'Foto Instalación 4',
      facility_4_title: 'Título Instalación 4',
      facility_4_description: 'Descripción Instalación 4'
    };
    return labels[key] || key;
  };

  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const sectionOrder = ['banner', 'rooms', 'rooms_display', 'facilities'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  const hasChanges = Object.keys(editedContent).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-3 sm:p-6">
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleGalleryFileChange}
      />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Administrar Contenido</h1>
            <p className="text-amber-300 mt-1 text-sm sm:text-base">Edita el contenido de la página de inicio</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button 
              onClick={fetchContent}
              variant="outline" 
              className="border-amber-500 text-amber-400 hover:bg-amber-500/20 flex-1 sm:flex-none"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Recargar</span>
            </Button>
            {hasChanges && (
              <Button 
                onClick={saveAllChanges}
                disabled={saving}
                className="gradient-turquoise text-white flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar Todo'}</span>
                <span className="sm:hidden">{saving ? '...' : 'Guardar'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sectionOrder.map(section => {
            const items = groupedContent[section] || [];
            if (items.length === 0) return null;
            
            const config = getSectionConfig(section);
            const isExpanded = expandedSections[section];

            return (
              <div key={section} className="bg-stone-800/50 backdrop-blur-sm rounded-xl border border-amber-500/20 overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      {section.includes('image') || section === 'facilities' ? (
                        <Image className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Type className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">{config.title}</h3>
                      <p className="text-sm text-slate-400">{config.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-4">
                    {items.map(item => {
                      const currentValue = editedContent[item.id] ?? item.content_value;
                      const isChanged = editedContent[item.id] !== undefined && editedContent[item.id] !== item.content_value;
                      const isGallery = item.content_key.endsWith('_images');

                      // Parse gallery images
                      let galleryImages: string[] = [];
                      if (isGallery) {
                        try {
                          galleryImages = JSON.parse(currentValue || '[]');
                        } catch {
                          galleryImages = [];
                        }
                      }

                      return (
                        <div key={item.id} className="bg-slate-700/30 rounded-lg p-4">
                          <label className="block text-sm font-medium text-amber-300 mb-2">
                            {getKeyLabel(item.content_key)}
                          </label>
                          
                          {isGallery ? (
                            // Gallery UI for multiple images
                            <div className="space-y-3">
                              <p className="text-xs text-slate-400">
                                Fotos adicionales que se mostrarán en el carrusel (la foto principal se configura arriba)
                              </p>
                              
                              {/* Gallery grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {galleryImages.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={img}
                                      alt={`Foto ${idx + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border border-slate-600"
                                    />
                                    <button
                                      onClick={() => removeGalleryImage(item.id, idx)}
                                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                
                                {/* Add photo button */}
                                <button
                                  onClick={() => handleGalleryUploadClick(item.id)}
                                  disabled={uploadingGalleryId === item.id}
                                  className="w-full h-24 border-2 border-dashed border-amber-500/40 rounded-lg flex flex-col items-center justify-center text-amber-400 hover:border-amber-400 hover:bg-amber-500/10 transition-colors"
                                >
                                  {uploadingGalleryId === item.id ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="w-6 h-6" />
                                      <span className="text-xs mt-1">Agregar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              
                              {galleryImages.length === 0 && (
                                <p className="text-sm text-slate-500 italic">
                                  No hay fotos adicionales. Haz clic en "Agregar" para subir.
                                </p>
                              )}
                            </div>
                          ) : item.content_type === 'image' ? (
                            <>
                              <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                  <Input
                                    value={currentValue}
                                    onChange={(e) => handleContentChange(item.id, e.target.value)}
                                    placeholder="URL de la imagen"
                                    className="flex-1 bg-slate-800 border-slate-600 text-white focus:border-amber-500"
                                  />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                  <Button
                                    onClick={() => handleUploadClick(item.id)}
                                    disabled={uploadingId === item.id}
                                    className="gradient-gold text-slate-900 font-medium w-full sm:w-auto"
                                  >
                                    {uploadingId === item.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Subir
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => saveContent(item)}
                                    disabled={saving || !isChanged}
                                    className={`${isChanged ? 'gradient-turquoise' : 'bg-slate-600 opacity-60'} text-white font-medium w-full sm:w-auto`}
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar
                                  </Button>
                                </div>
                              </div>
                              {/* Image Preview */}
                              {currentValue && (
                                <div className="mt-3">
                                  <p className="text-xs text-slate-400 mb-2">Vista previa:</p>
                                  <img 
                                    src={currentValue} 
                                    alt="Preview" 
                                    className="h-32 w-auto rounded-lg object-cover border border-slate-600"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {item.content_key.includes('subtitle') || item.content_key.includes('description') ? (
                                <textarea
                                  value={currentValue}
                                  onChange={(e) => handleContentChange(item.id, e.target.value)}
                                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none min-h-[80px] resize-y"
                                  placeholder="Ingrese el texto aquí..."
                                />
                              ) : (
                                <Input
                                  value={currentValue}
                                  onChange={(e) => handleContentChange(item.id, e.target.value)}
                                  className="flex-1 bg-slate-800 border-slate-600 text-white focus:border-cyan-500"
                                  placeholder="Ingrese el texto aquí..."
                                />
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <Button
                                  onClick={() => saveContent(item)}
                                  disabled={saving || !isChanged}
                                  className={`${isChanged ? 'gradient-turquoise' : 'bg-slate-600 opacity-60'} text-white font-medium w-full sm:w-auto`}
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Guardar
                                </Button>
                                {isChanged && (
                                  <span className="text-yellow-400 text-sm flex items-center justify-center sm:justify-start">
                                    ⚠️ Cambios sin guardar
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-300 text-sm">
            <strong>Nota:</strong> Para las imágenes, puedes hacer clic en "Subir" para seleccionar una foto desde tu dispositivo, 
            o pegar una URL de imagen directamente. Los cambios se reflejarán inmediatamente en la página de inicio.
          </p>
        </div>
      </div>

      {/* Footer Credit */}
      <div className="text-center py-6 border-t border-stone-700 mt-8">
        <p className="text-stone-400 text-sm">
          Posada Perla Negra — <span className="font-semibold text-amber-400">18 años de experiencia</span>
        </p>
        <p className="text-stone-400 text-sm">
          Centro de Tucacas, Morrocoy — <span className="text-amber-400">Lugar Familiar</span>
        </p>
      </div>
    </div>
  );
}
