let currentUser=null;
let classes=[];

function showAlert(msg,type='success'){
  const c=document.getElementById('alert-container');
  const div=document.createElement('div');
  div.className=`alert ${type}`;
  div.textContent=msg;
  c.appendChild(div);
  setTimeout(()=>div.remove(),3000);
}

function showSection(id,btnId){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  if(btnId) document.getElementById(btnId).classList.add('active');
  if(id==='student') loadClasses();
  if(id==='admin') loadAdminClasses();
}

function login(){
  const u=document.getElementById('username').value.trim();
  const p=document.getElementById('password').value.trim();
  const t=document.getElementById('userType').value;
  if(!u||!p){showAlert('⚠ Username & Password wajib!','error');return;}
  if(t==='admin'&&u==='admin'&&p==='admin123'){currentUser={type:'admin'}}
  else if(t==='student'&&u==='student'&&p==='student123'){currentUser={type:'student'}}
  else {showAlert('❌ Login gagal','error');return;}
  document.getElementById('homeBtn').style.display='none';
  document.getElementById('loginBtn').style.display='none';
  document.getElementById('logoutBtn').style.display='inline-block';
  if(currentUser.type==='admin'){document.getElementById('adminBtn').style.display='inline-block';showSection('admin','adminBtn')}
  else{document.getElementById('studentBtn').style.display='inline-block';showSection('student','studentBtn')}
  showAlert('✅ Login berhasil','success');
}
function logout(){currentUser=null;
  document.getElementById('studentBtn').style.display='none';
  document.getElementById('adminBtn').style.display='none';
  document.getElementById('logoutBtn').style.display='none';
  document.getElementById('homeBtn').style.display='inline-block';
  document.getElementById('loginBtn').style.display='inline-block';
  showSection('home','homeBtn');}

function addClass(){
  const n=document.getElementById('className').value.trim();
  const q=parseInt(document.getElementById('quota').value);
  if(!n||!q||q<=0){showAlert('⚠ Nama/kuota tidak valid','error');return;}
  if(classes.some(c=>c.name.toLowerCase()===n.toLowerCase())){showAlert('❌ Kelas sudah ada','error');return;}
  classes.push({name:n,quota:q,students:[]});
  document.getElementById('className').value='';document.getElementById('quota').value='';
  loadAdminClasses();showAlert('✅ Kelas ditambahkan','success');
}

function validatePhone(p){return /^[0-9]{10,15}$/.test(p);}

function loadClasses(){
  const list=document.getElementById('class-list');list.innerHTML='';
  if(classes.length===0){list.innerHTML='<div class="empty-state"><div class="empty-state-icon">📚</div><h3>Belum ada kelas</h3></div>';return;}
  classes.forEach((c,i)=>{
    const rem=c.quota-c.students.length;
    list.innerHTML+=`
    <div class="class-card">
      <h4>${c.name}</h4>
      <div class="quota-info"><span>Kuota: ${c.quota}</span>
      <span class="${rem>0?'quota-available':'quota-full'}">${rem>0?'Tersisa: '+rem:'Penuh'}</span></div>
      <div class="student-input-container">
        <input type="text" id="studentName-${i}" placeholder="Nama lengkap" ${rem<=0?'disabled':''}>
        <input type="tel" id="studentPhone-${i}" placeholder="No. Telepon" ${rem<=0?'disabled':''}>
        <button onclick="registerClass(${i})" ${rem<=0?'disabled':''}>${rem>0?'Daftar':'Penuh'}</button>
      </div>
    </div>`;
  });
}

function registerClass(i){
  if(!currentUser||currentUser.type!=='student'){showAlert('❌ Login sebagai siswa!','error');return;}
  const n=document.getElementById(`studentName-${i}`).value.trim();
  const ph=document.getElementById(`studentPhone-${i}`).value.trim();
  if(!n||!ph){showAlert('⚠ Nama & telepon wajib','error');return;}
  if(n.length<3){showAlert('⚠ Nama minimal 3 huruf','error');return;}
  if(!validatePhone(ph)){showAlert('⚠ Telepon 10-15 digit','error');return;}
  const c=classes[i];
  if(c.students.some(s=>s.name.toLowerCase()===n.toLowerCase())){showAlert('❌ Sudah terdaftar','error');return;}
  if(c.students.length>=c.quota){showAlert('❌ Kuota penuh','error');return;}
  c.students.push({name:n,phone:ph});
  loadClasses();loadAdminClasses();
  showAlert(`🎉 ${n} terdaftar di ${c.name}`,'success');
}

function loadAdminClasses(){
  const list=document.getElementById('admin-class-list');list.innerHTML='';
  if(classes.length===0){list.innerHTML='<div class="empty-state"><div class="empty-state-icon">📚</div><h3>Belum ada kelas</h3></div>';return;}
  classes.forEach((c,ci)=>{
    const rem=c.quota-c.students.length;
    let participants=c.students.map((s,si)=>`
      <div class="participant-row">
        <span class="participant-name">${s.name} (${s.phone})</span>
        <button class="remove-btn" onclick="removeStudent(${ci},${si})">Hapus</button>
      </div>`).join('');
    if(!participants) participants='<span style="color:#718096;font-size:.9rem">Belum ada peserta</span>';
    list.innerHTML+=`
    <div class="class-card">
      <h4>${c.name}</h4>
      <div class="quota-info"><span>${c.students.length}/${c.quota}</span>
      <span class="${rem>0?'quota-available':'quota-full'}">${rem>0?'Tersisa '+rem:'Penuh'}</span></div>
      <div class="participants-list"><div class="participants-title">Peserta:</div>${participants}</div>
    </div>`;
  });
}

function removeStudent(ci,si){
  classes[ci].students.splice(si,1);
  loadAdminClasses();loadClasses();
  showAlert('🗑 Peserta dihapus','success');
}

function exportCSV(){
  let csv="Nama Kelas,Nama,Telepon\n";
  classes.forEach(c=>c.students.forEach(s=>csv+=`${c.name},"${s.name}",${s.phone}\n`));
  const blob=new Blob([csv],{type:"text/csv"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="peserta.csv";a.click();
}

function exportPDF(){
  let w=window.open("","_blank");w.document.write("<h2>Daftar Peserta</h2>");
  classes.forEach(c=>{
    w.document.write(`<h3>${c.name}</h3><ul>`);
    c.students.forEach(s=>w.document.write(`<li>${s.name} (${s.phone})</li>`));
    w.document.write("</ul>");
  });
  w.print();
}
