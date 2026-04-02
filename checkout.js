// Checkout script updated to store order details and redirect to success page
document.addEventListener('DOMContentLoaded', ()=>{
  const cart = JSON.parse(localStorage.getItem('st_cart') || '[]');
  const summaryList = document.getElementById('summary-list');
  const totalBox = document.getElementById('checkout-total');
  let total = 0;
  summaryList.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name + ' x ' + (item.quantity || 1);
    const span = document.createElement('span');
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    span.textContent = 'KES ' + itemTotal.toFixed(0);
    li.appendChild(span);
    summaryList.appendChild(li);
    total += itemTotal;
  });
  totalBox.textContent = 'KES ' + total.toFixed(0);

  const payNow = document.getElementById('pay-now');
  if(payNow){
    payNow.addEventListener('click', ()=> {
      if(cart.length === 0){ alert('Your cart is empty. Add items before paying.'); return; }
      const name = document.getElementById('cust-name').value || 'Customer';
      const email = document.getElementById('cust-email').value || 'customer@example.com';
      const order = { customer:{name, email}, items: cart, total: total, paidAt: new Date().toISOString() };
      localStorage.setItem('st_last_order', JSON.stringify(order));
      localStorage.removeItem('st_cart');
      window.location.href = 'success.html';
    });
  }
});