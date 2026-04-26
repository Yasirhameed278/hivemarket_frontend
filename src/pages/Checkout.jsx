import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CheckCircle, Lock, Tag, Truck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { formatPKR } from '../utils/currency';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STEPS = ['Shipping', 'Payment', 'Review'];

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

// Inner component — must be inside <Elements> to use useStripe / useElements
function CheckoutForm() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
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
  const shippingCost = subtotal > 100 || appliedCoupon === 'FREESHIP' ? 0 : 9.99;
  const tax = subtotal * 0.05;
  const discount =
    appliedCoupon === 'SAVE10' ? subtotal * 0.1 :
    appliedCoupon === 'SAVE20' ? subtotal * 0.2 : 0;
  const total = subtotal + shippingCost + tax - discount;

  const applyCoupon = () => {
    const valid = ['SAVE10', 'SAVE20', 'FREESHIP'];
    if (valid.includes(coupon.toUpperCase())) {
      setAppliedCoupon(coupon.toUpperCase());
      setCouponError('');
      toast.success(`Coupon applied: ${coupon.toUpperCase()}`);
    } else {
      setCouponError('Invalid coupon code');
    }
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

        // 1. Create a PaymentIntent on our backend
        const { data: intentData } = await api.post('/payment/create-intent', {
          amount: total,
        });

        // 2. Confirm the card with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: { name: shipping.name },
            },
          }
        );

        if (error) {
          toast.error(error.message || 'Payment failed');
          return;
        }

        if (paymentIntent.status !== 'succeeded') {
          toast.error('Payment was not completed');
          return;
        }

        paymentIntentId = paymentIntent.id;
      }

      // 3. Create the order on our backend
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
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full mx-4 p-8 text-center animate-scale-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-400 text-sm mb-6">
          {paymentMethod === 'cod'
            ? 'Your order is confirmed. Pay on delivery.'
            : 'Payment successful! You\'ll receive a confirmation shortly.'}
        </p>
        <div className="flex gap-3">
          <Link to={`/orders/${orderId}`} className="btn-primary flex-1 py-3">Track Order</Link>
          <Link to="/products" className="btn-secondary flex-1 py-3">Shop More</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-sm font-medium transition-all ${i <= step ? 'text-brand-600' : 'text-gray-400'} ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step ? 'bg-brand-500 border-brand-500 text-white' :
                  i === step ? 'border-brand-500 text-brand-600' : 'border-gray-300 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-brand-500' : 'bg-gray-200'}`} />
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
                <h2 className="font-semibold text-gray-900 mb-5">Shipping Information</h2>
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
                  className="btn-primary w-full mt-6 py-3 disabled:opacity-40"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* ── Step 1: Payment ───────────────────────────────── */}
            {/* Keep this mounted (hidden) on step 2 so CardElement stays alive */}
            <div className={step === 1 ? 'animate-fade-in' : step === 2 ? 'hidden' : 'hidden'}>
              <h2 className="font-semibold text-gray-900 mb-5">Payment Method</h2>

                {/* Method selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    ['card', 'Credit / Debit Card', CreditCard],
                    ['cod', 'Cash on Delivery', Truck],
                  ].map(([m, l, Icon]) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === m
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {l}
                    </button>
                  ))}
                </div>

                {/* Stripe CardElement — always rendered when card is selected so element stays mounted */}
                <div className={paymentMethod === 'card' ? 'space-y-4' : 'hidden'}>
                  <div>
                    <label className="label">Card Details</label>
                    <div className="input py-3 px-4">
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
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                    Test card: <span className="font-mono font-medium text-gray-600">4242 4242 4242 4242</span> · any future expiry · any 3-digit CVC
                  </p>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <p className="font-medium mb-1">Cash on Delivery</p>
                    <p className="text-xs text-amber-600">Pay when your order is delivered. Applicable in select areas.</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={paymentMethod === 'card' && !cardComplete}
                    className="btn-primary flex-1 py-3 disabled:opacity-40"
                  >
                    Review Order
                  </button>
                </div>
            </div>

            {/* ── Step 2: Review ────────────────────────────────── */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="font-semibold text-gray-900 mb-5">Review Your Order</h2>
                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item._id} className="flex items-center gap-3 py-3 border-b border-gray-50">
                      <img
                        src={item.product?.thumbnail}
                        alt={item.product?.name}
                        className="w-14 h-14 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product?.name}</p>
                        {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatPKR(item.product?.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl text-sm space-y-1 mb-3">
                  <p className="font-medium text-gray-700">Shipping to:</p>
                  <p className="text-gray-500">
                    {shipping.name}, {shipping.street}, {shipping.city}, {shipping.state} {shipping.zipCode}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl text-sm mb-5">
                  <p className="font-medium text-gray-700">
                    Payment: {paymentMethod === 'card' ? 'Credit / Debit Card (Stripe)' : 'Cash on Delivery'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                  <button
                    onClick={handleOrder}
                    disabled={placing || !stripe}
                    className="btn-primary flex-1 py-3 shadow-glow disabled:opacity-40"
                  >
                    <Lock className="w-4 h-4" />
                    {placing
                      ? (paymentMethod === 'card' ? 'Processing payment...' : 'Placing order...')
                      : (paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatPKR(total)}`)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                    {shippingCost === 0 ? 'FREE' : formatPKR(shippingCost)}
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
                <div className="border-t pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span><span>{formatPKR(total)}</span>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-500" /> Coupon Code
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-xl">
                  <span className="text-sm font-mono font-bold">{appliedCoupon} applied ✓</span>
                  <button onClick={() => setAppliedCoupon('')} className="text-green-500 hover:text-green-700 text-xs">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter code"
                    className="input text-sm flex-1"
                  />
                  <button onClick={applyCoupon} className="btn-primary text-sm px-4">Apply</button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
              <Lock className="w-3.5 h-3.5 text-green-500" />
              <span>All transactions are secured by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Outer wrapper — provides the Stripe context
export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
