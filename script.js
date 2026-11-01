/* BrightPath: small, dependency-free enhancements. No analytics or form storage. */
(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const mobile = document.querySelector('#mobile-nav');
  function closeMenu(focus = false) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    mobile.hidden = true;
    if (focus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    else { toggle.setAttribute('aria-expanded','true'); toggle.setAttribute('aria-label','Close navigation'); mobile.hidden=false; }
  });
  document.addEventListener('keydown', e => { if (e.key==='Escape' && !mobile.hidden) closeMenu(true); });
  document.addEventListener('click', e => { if (!mobile.hidden && !e.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('focusin', e => { if (!mobile.hidden && !e.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width:801px)').addEventListener('change',e => { if(e.matches)closeMenu(); });

  const privacy = document.getElementById('privacy-dialog');
  document.querySelectorAll('[data-privacy-open]').forEach(button => button.addEventListener('click', () => privacy.showModal()));
  document.querySelectorAll('[data-privacy-close]').forEach(button => button.addEventListener('click', () => privacy.close()));
  privacy.addEventListener('click', e => { if (e.target===privacy) { const r=privacy.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)privacy.close(); } });

  const levelFilter = document.getElementById('level-filter');
  const subjectFilter = document.getElementById('subject-filter');
  if (levelFilter && subjectFilter) {
    const initialLevel = new URLSearchParams(location.search).get('level');
    if (['primary','secondary'].includes(initialLevel)) levelFilter.value=initialLevel;
    function filterProgrammes() {
      let count=0;
      document.querySelectorAll('[data-programme]').forEach(card => {
        const visible=(levelFilter.value==='all'||card.dataset.level===levelFilter.value)&&(subjectFilter.value==='all'||card.dataset.subject===subjectFilter.value);
        card.hidden=!visible; if(visible)count++;
      });
      document.getElementById('programme-count').textContent=count+(count===1?' programme':' programmes');
      document.getElementById('programme-empty').hidden=count>0;
    }
    levelFilter.addEventListener('change',filterProgrammes);
    subjectFilter.addEventListener('change',filterProgrammes);
    filterProgrammes();
  }

  const feeLevel=document.getElementById('fee-level');
  if(feeLevel) {
    const subjects=[...document.querySelectorAll('input[name="fee-subject"]')];
    function updateFees() {
      const selected=subjects.filter(field=>field.checked);
      const rate=feeLevel.value==='secondary'?200:160;
      const level=feeLevel.value==='secondary'?'Secondary':'Primary';
      document.getElementById('fee-total').textContent='S$'+(selected.length*rate).toLocaleString('en-SG');
      document.getElementById('fee-summary').textContent=selected.length?level+' · '+selected.map(field=>field.value==='maths'?'Maths':'Science').join(' + ')+' · Four lessons per subject.':'Select at least one subject to estimate the fee.';
    }
    feeLevel.addEventListener('change',updateFees);
    subjects.forEach(field=>field.addEventListener('change',updateFees));
    updateFees();
  }

  // Reveal content once as it enters view. Motion follows the device accessibility setting.
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if('IntersectionObserver' in window && !reducedMotion.matches) {
    const candidates=document.querySelectorAll('.section-heading,.stage-card,.home-approach-copy,.group-photo,.practical-grid article,.cta-panel,.programme-card,.programme-advice,.approach-image,.lesson-flow li,.worked-example-copy,.worked-example,.fee-card,.fee-estimator,.faq-list details,.contact-info,.enquiry-panel,.hero-facts p');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
      });
    },{threshold:0.08,rootMargin:'0px 0px -35px 0px'});
    candidates.forEach(element=>{
      // Do not hide anything already visible when the page first loads.
      const bounds=element.getBoundingClientRect();
      if(bounds.top<innerHeight && bounds.bottom>0)return;
      element.setAttribute('data-reveal','');
      if(element.parentElement.matches('.grid-two,.grid-three,.practical-grid,.hero-facts')) {
        const index=[...element.parentElement.children].indexOf(element);
        element.style.setProperty('--reveal-delay',Math.min(index*75,150)+'ms');
      }
      observer.observe(element);
    });
    reducedMotion.addEventListener('change',event=>{
      if(event.matches){document.querySelectorAll('[data-reveal]').forEach(element=>element.classList.add('is-visible'));observer.disconnect();}
    });
  }

  const form=document.getElementById('enquiry-form');
  if(form) {
    const fields=['parent-name','parent-email','student-level','consent'].map(id=>document.getElementById(id));
    const summary=document.getElementById('enquiry-errors');
    const status=document.getElementById('enquiry-status');
    const programme=document.getElementById('enquiry-programme');
    const initialProgramme=new URLSearchParams(location.search).get('programme');
    if([...programme.options].some(option=>option.value===initialProgramme))programme.value=initialProgramme;
    function validate(field) {
      let error='';
      if(field.id==='consent'&&!field.checked)error='Please confirm that you are using sample details for this demo.';
      else if(field.id==='parent-name'&&!field.value.trim())error='Please enter a sample parent or guardian name.';
      else if(field.id==='parent-email'&&!field.value.trim())error='Please enter a sample email address.';
      else if(field.id==='parent-email'&&field.validity.typeMismatch)error='Use a valid email format, such as alex@example.com.';
      else if(field.id==='student-level'&&!field.value)error='Please choose a school level.';
      else if(field.id==='student-level'&&programme.value.startsWith('primary-')&&!field.value.startsWith('P'))error='Choose a Primary level for this programme, or change the programme.';
      else if(field.id==='student-level'&&programme.value.startsWith('secondary-')&&!field.value.startsWith('S'))error='Choose a Secondary level for this programme, or change the programme.';
      document.getElementById(field.id+'-error').textContent=error;
      if(error)field.setAttribute('aria-invalid','true');else field.removeAttribute('aria-invalid');
      return !error;
    }
    fields.forEach(field=>field.addEventListener(field.type==='checkbox'||field.tagName==='SELECT'?'change':'input',()=>{
      if(field.hasAttribute('aria-invalid'))validate(field);
      if(fields.every(item=>!item.hasAttribute('aria-invalid')))summary.hidden=true;
      status.hidden=true;
    }));
    programme.addEventListener('change',()=>{const level=document.getElementById('student-level');if(level.hasAttribute('aria-invalid'))validate(level);if(fields.every(item=>!item.hasAttribute('aria-invalid')))summary.hidden=true;status.hidden=true;});
    document.getElementById('enquiry-message').addEventListener('input',()=>{status.hidden=true;});
    form.addEventListener('submit',e=>{
      e.preventDefault();status.hidden=true;
      const valid=fields.map(validate).every(Boolean);
      if(!valid){const count=fields.filter(field=>field.hasAttribute('aria-invalid')).length;summary.textContent='Please check '+count+(count===1?' field':' fields')+' below.';summary.hidden=false;fields.find(field=>field.hasAttribute('aria-invalid')).focus();return;}
      summary.hidden=true;
      const chosen=programme.options[programme.selectedIndex].text;
      const level=document.getElementById('student-level');
      status.textContent='Enquiry preview ready: '+chosen+' · '+level.options[level.selectedIndex].text+'. This was a demo. No message was sent or stored, and no class place has been reserved.';
      form.reset();status.hidden=false;status.focus({preventScroll:true});
    });
    document.getElementById('enquiry-fields').disabled=false;
  }
})();
