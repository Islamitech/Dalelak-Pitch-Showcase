import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Database, 
  Receipt, 
  DollarSign, 
  User, 
  Phone, 
  FileCheck, 
  Sparkles, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PitchPackage, PromoteLeadPayload } from '../types';
import { promoteBusinessToCoreProd } from '../services/dalilakService';

interface PromoteLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: PitchPackage;
  onSuccess: (invoiceNumber: string) => void;
}

export const PromoteLeadModal: React.FC<PromoteLeadModalProps> = ({
  isOpen,
  onClose,
  pitch,
  onSuccess
}) => {
  const [packageName, setPackageName] = useState(pitch.packageName);
  const [finalPrice, setFinalPrice] = useState(pitch.discountedPrice);
  const [repName, setRepName] = useState('أحمد كمال (مندوب التسويق الميداني)');
  const [clientPhone, setClientPhone] = useState(pitch.business.phone);
  const [invoiceNumber, setInvoiceNumber] = useState(`DL-INV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [unwatermarkedAuthorized, setUnwatermarkedAuthorized] = useState(true);
  const [notes, setNotes] = useState('تمت موافقة صاحب النشاط عبر واتساب وجاري استلام الدفعة وتسليم ستاند الأكريليك.');
  
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{ invoice: string; message: string } | null>(null);

  if (!isOpen) return null;

  const handlePromote = async () => {
    setSubmitting(true);
    try {
      const payload: PromoteLeadPayload = {
        businessId: pitch.businessId,
        packageSelected: packageName,
        invoiceNumber,
        finalPrice,
        representativeName: repName,
        clientConfirmationPhone: clientPhone,
        unwatermarkedAssetsReady: unwatermarkedAuthorized,
        notes,
        promotedAt: new Date().toISOString()
      };

      const res = await promoteBusinessToCoreProd(payload);
      setSuccessResult({
        invoice: res.invoiceNumber,
        message: res.message
      });

      // Fire victory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess(res.invoiceNumber);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-500 text-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black">
                ترقية العميل واعتماده في السيرفر الأساسي لدليلك 🚀
              </h2>
              <p className="text-xs text-slate-900 font-semibold opacity-90">
                ترحيل النشاط من مرحلة المعاينة إلى قاعدة الإنتاج الرسمية وإصدار الفاتورة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-950 hover:bg-amber-600/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">ألف مبروك! تم إغلاق الصفقة بنجاح 💎</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {successResult.message}
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto text-xs space-y-1">
              <span className="text-slate-500 block">رقم الفاتورة الرسمية:</span>
              <strong className="text-sm font-mono font-black text-slate-900 block">{successResult.invoice}</strong>
            </div>
            <div className="pt-3">
              <button
                onClick={onClose}
                className="bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                إغلاق والعودة للاستوديو
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <div className="p-5 space-y-4 overflow-y-auto">
            
            {/* Target Business Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-bold">النشاط التجاري المراد اعتماده:</span>
                <strong className="text-sm text-slate-900 font-black">{pitch.business.name_ar}</strong>
              </div>
              <span className="bg-amber-100 text-amber-800 font-black px-2.5 py-1 rounded-lg">
                {pitch.business.city || 'الفرع الرئيسي'}
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الباقة المعتمدة:</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">القيمة المالية المتفق عليها (جنيه):</label>
                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الفاتورة الرسمية:</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">مندوب المتابعة والتنفيذ:</label>
                <input
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>

            {/* Client phone */}
            <div className="text-xs">
              <label className="block text-slate-700 font-bold mb-1">رقم واتساب العميل المؤكد للتعاقد:</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Asset Authorization Checkbox */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
              <input
                type="checkbox"
                id="auth-assets"
                checked={unwatermarkedAuthorized}
                onChange={(e) => setUnwatermarkedAuthorized(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-0.5 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="auth-assets" className="text-xs text-slate-800 cursor-pointer">
                <strong className="block text-emerald-950 font-black">
                  تفويض تسليم الأصول النقية بدون علامة مائية (High-Res Authorization)
                </strong>
                <span>إزالة العلامة المائية الشبكية وتوليد ملفات الطباعة الأصلية للشعار والستاند الأكريليكي للمندوب.</span>
              </label>
            </div>

            {/* Notes */}
            <div className="text-xs">
              <label className="block text-slate-700 font-bold mb-1">ملاحظات التعاقد وسجل التشغيل:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handlePromote}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? 'جاري الترقية...' : 'تأكيد الترقية والاعتماد الرسمي 🚀'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
