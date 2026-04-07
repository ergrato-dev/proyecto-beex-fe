/**
 * Archivo: pages/ContactPage.tsx
 * Descripción: Página de contacto con información y formulario de contacto.
 * ¿Para qué? Permitir a los usuarios enviar consultas o reportar problemas.
 * ¿Impacto? Punto de comunicación directo entre usuarios y el equipo de NN.
 */

import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Alert } from '@/components/ui/Alert';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // ¿Qué? Simulación de envío — en producción llamaría a un endpoint de contacto.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-12 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
          {t('contact.title')}
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Información de contacto */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
            {t('contact.infoHeading')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail
                size={18}
                className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {t('contact.emailInfoLabel')}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  contacto@nn-company.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone
                size={18}
                className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {t('contact.phoneLabel')}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  +57 (1) 234-5678
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin
                size={18}
                className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {t('contact.addressLabel')}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Bogotá, Colombia
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
              {t('contact.hoursLabel')}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Lunes a viernes: 8:00 AM – 6:00 PM
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Tiempo de respuesta estimado: 24 horas
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">
            {t('contact.sendMessage')}
          </h2>

          {success ? (
            <Alert
              type="success"
              message={t('contact.successMessage')}
            />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <InputField
                id="name"
                name="name"
                label={t('contact.nameLabel')}
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
              />

              <InputField
                id="email"
                name="email"
                label={t('auth.emailLabel')}
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.emailPlaceholder')}
              />

              <InputField
                id="subject"
                name="subject"
                label={t('contact.subjectLabel')}
                type="text"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="¿En qué podemos ayudarte?"
              />

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  {t('contact.messageLabel')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600
                    bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
                    px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isLoading}>
                  {t('contact.submitButton')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
