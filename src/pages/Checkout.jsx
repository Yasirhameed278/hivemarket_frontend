import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CheckCircle, Lock, Tag, Truck, CreditCard, MapPin, Package, Sparkles, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { formatPKR } from '../utils/currency';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STEPS = [
  { label: 'Shipping', icon: MapPin },
  { label: 'Payment', icon: CreditCard },
  { label: 'Review', icon: Package },
];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#111827',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
      iconColor: '#f97316',
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

function CheckoutForm() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardComplete, setCardComplete] = useState(false);

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    zipCode: user?.addresses?.[0]?.zipCode || '',
    country: 'Pakistan',
    phone: user?.phone || '',
  });

  const subtotal = getTotal();
  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.05;
  const discount = appliedCouponData?.discountAmount || 0;
  const total = subtotal + shippingCost + tax - discount;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await api.post('/coupons/validate', { code: coupon.trim(), subtotal });
      setAppliedCoupon(data.code);
      setAppliedCouponData(data);
      toast.success(data.message);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon('');
      setAppliedCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    setAppliedCouponData(null);
    setCoupon('');
    setCouponError('');
  };

  const handleOrder = async () => {
    if (items.length === 0) return toast.error('Cart is empty');
    setPlacing(true);

    try {
      let paymentIntentId = null;

      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          toast.error('Stripe not loaded');
          return;
        }

        const { data: intentData } = await api.post('/payment/create-intent', { amount: total });

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: { name: shipping.name },
            },
          }
        );

        if (error) { toast.error(error.message || 'Payment failed'); return; }
        if (paymentIntent.status !== 'succeeded') { toast.error('Payment was not completed'); return; }

        paymentIntentId = paymentIntent.id;
      }

      const { data } = await api.post('/orders', {
        items: items.map(i => ({
          product: i.product._id,
          quantity: i.quantity,
          variant: i.variant,
        })),
        shippingAddress: shipping,
        paymentMethod,
        couponCode: appliedCoupon,
        paymentIntentId,
      });

      await clearCart();
      setOrderId(data._id);
      setOrderNumber(data.orderNumber || data._id?.slice(-6).toUpperCase());
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Order failed';
      console.error('Checkout error:', err.response?.data || err.message);
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────
  if (step === 3) return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50">
      {/* Confetti dots background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['top-10 left-1/4', 'top-20 right-1/3', 'top-1/3 left-10', 'top-1/4 right-10', 'bottom-1/3 left-1/4', 'bottom-1/4 right-1/4'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-2 h-2 rounded-full opacity-30 animate-float`}
            style={{
              background: ['#f97316','#fb923c','#fbbf24','#34d399','#60a5fa','#a78bfa'][i],
              animationDelay: `${i * 0.3}s`,
            }} />
        ))}
      </div>

      <div className="relative max-w-md w-full mx-4 animate-scale-in">
        {/* Top glow */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-400/20 rounded-full blur-2xl" />

        <div className="relative card overflow-hidden">
          {/* Green header band */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-400 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-white/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-1">Order Confirmed!</h2>
            <p className="text-green-100 text-sm">
              {paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment successful'}
            </p>
          </div>

          <div className="p-6">
            {/* Order number */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-5 border border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order number</p>
                <p className="font-mono font-bold text-gray-900 text-sm tracking-wider">#{orderNumber}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            </div>

            {/* Perks */}
            <div className="space-y-2.5 mb-6">
              {[
                ['Confirmation email sent', 'text-blue-500'],
                ['Estimated delivery in 3–5 days', 'text-purple-500'],
                [paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment secured via Stripe', 'text-green-500'],
              ].map(([text, color]) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <div className={`w-5 h-5 rounded-full bg-current/10 flex items-center justify-center shrink-0 ${color}`}>
                    <Check className="w-3 h-3" />
                  </div>
                  {text}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link to={`/orders/${orderId}`}
                className="btn-primary flex-1 py-3 rounded-xl shadow-glow">
                <Package className="w-4 h-4" /> Track Order
              </Link>
              <Link to="/products"
                className="btn-secondary flex-1 py-3 rounded-xl">
                Shop More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map(({ label, icon: Icon }, i) => (
            <React.Fragment key={label}>
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2.5 text-sm font-medium transition-all ${i <= step ? 'text-brand-600' : 'text-gray-400'} ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  i < step
                    ? 'bg-gradient-to-r from-brand-500 to-orange-400 text-white shadow-glow'
                    : i === step
                      ? 'bg-gradient-to-r from-brand-500 to-orange-400 text-white shadow-glow ring-4 ring-brand-500/20'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="hidden sm:block">{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${i < step ? 'bg-gradient-to-r from-brand-500 to-orange-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form panel */}
          <div className="lg:col-span-2 card p-6">

            {/* ── Step 0: Shipping ──────────────────────────────── */}
            {step === 0 && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <MapPin className="w-4.5 h-4.5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">Shipping Information</h2>
                    <p className="text-xs text-gray-400">Where should we deliver your order?</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['name', 'Full Name', 'col-span-2'],
                    ['phone', 'Phone Number', 'col-span-2'],
                    ['street', 'Street Address', 'col-span-2'],
                    ['city', 'City', ''],
                    ['state', 'State / Province', ''],
                    ['zipCode', 'ZIP / Postal Code', ''],
                    ['country', 'Country', ''],
                  ].map(([field, label, cls]) => (
                    <div key={field} className={cls}>
                      <label className="label">{label}</label>
                      <input
                        value={shipping[field]}
                        onChange={(e) => setShipping(p => ({ ...p, [field]: e.target.value }))}
                        className="input"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  disabled={!shipping.name || !shipping.street || !shipping.city}
                  className="btn-primary w-full mt-6 py-3 disabled:opacity-40 shadow-glow"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── Step 1: Payment ───────────────────────────────── */}
            <div className={step === 1 ? 'animate-fade-in' : step === 2 ? 'hidden' : 'hidden'}>
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <CreditCard className="w-4.5 h-4.5 text-purple-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">Payment Method</h2>
                  <p className="text-xs text-gray-400">Choose how you'd like to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  ['card', 'Credit / Debit Card', CreditCard, 'text-purple-600 bg-purple-50'],
                  ['cod', 'Cash on Delivery', Truck, 'text-amber-600 bg-amber-50'],
                ].map(([m, l, Icon, iconCls]) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-2.5 ${
                      paymentMethod === m
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-inner-brand'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === m ? 'bg-brand-100' : iconCls}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {l}
                  </button>
                ))}
              </div>

              <div className={paymentMethod === 'card' ? 'space-y-4' : 'hidden'}>
                <div>
                  <label className="label">Card Details</label>
                  <div className="input py-3 px-4 ring-0">
                    <CardElement
                      options={CARD_ELEMENT_OPTIONS}
                      onChange={(e) => setCardComplete(e.complete)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-3.5 h-3.5 text-green-500" />
                  <span>Secured by Stripe — your card details are never stored on our servers</span>
                </div>
                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                  Test card: <span className="font-mono font-medium text-gray-700">4242 4242 4242 4242</span> · any future expiry · any 3-digit CVC
                </p>
              </div>

              {paymentMethod === 'cod' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                  <p className="font-semibold mb-1 flex items-center gap-2"><Truck className="w-4 h-4" /> Cash on Delivery</p>
                  <p className="text-xs text-amber-600">Pay when your order is delivered. Applicable in select areas.</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">← Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={paymentMethod === 'card' && !cardComplete}
                  className="btn-primary flex-1 py-3 disabled:opacity-40 shadow-glow"
                >
                  Review Order <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Step 2: Review ────────────────────────────────── */}
            {step === 2 && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                    <Package className="w-4.5 h-4.5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">Review Your Order</h2>
                    <p className="text-xs text-gray-400">Double-check before placing</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item._id} className="flex items-center gap-3.5 py-3 border-b border-gray-50 last:border-0">
                      <div className="relative shrink-0">
                        <img
                          src={item.product?.thumbnail}
                          alt={item.product?.name}
                          className="w-14 h-14 object-cover rounded-xl shadow-sm"
                        />
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product?.name}</p>
                        {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                        <p className="text-xs text-gray-400">{formatPKR(item.product?.price)} each</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{formatPKR(item.product?.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Delivering to</p>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {shipping.name}<br />
                      {shipping.street}, {shipping.city}<br />
                      {shipping.state} {shipping.zipCode}, {shipping.country}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Payment</p>
                    </div>
                    <p className="text-gray-600 text-xs">
                      {paymentMethod === 'card' ? 'Credit / Debit Card via Stripe' : 'Cash on Delivery'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button
                    onClick={handleOrder}
                    disabled={placing || !stripe}
                    className="btn-primary flex-1 py-3 shadow-glow disabled:opacity-40"
                  >
                    <Lock className="w-4 h-4" />
                    {placing
                      ? (paymentMethod === 'card' ? 'Processing...' : 'Placing order...')
                      : (paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatPKR(total)}`)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" /> Order Summary
              </h3>
              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={shippingCost === 0 || appliedCouponData?.type === 'freeship' ? 'text-green-600 font-medium' : ''}>
                    {shippingCost === 0 || appliedCouponData?.type === 'freeship' ? 'FREE' : formatPKR(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span><span>{formatPKR(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span><span>-{formatPKR(discount)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gradient">{formatPKR(total)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-500" /> Coupon Code
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2.5 rounded-xl border border-green-200">
                  <span className="text-sm font-mono font-bold">{appliedCoupon} ✓</span>
                  <button onClick={removeCoupon} className="text-green-500 hover:text-green-700 text-xs font-medium">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                    placeholder="Enter code"
                    className="input text-sm flex-1"
                  />
                  <button onClick={applyCoupon} disabled={couponLoading} className="btn-primary text-sm px-4 disabled:opacity-40">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-1.5">{couponError}</p>}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
              <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <span>All transactions are secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
