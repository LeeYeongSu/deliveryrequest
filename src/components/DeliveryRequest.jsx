// 출고 요청 컴포넌트 전체 수정본 (제품사진, 출고증 사진 포함 + 검색창 4개 복원)

import React, { useState, useEffect } from 'react';
import './DeliveryRequest.css'
import { exportJson } from "../utils/fileExport.js";


const formatPhoneNumber = (value) => {
  const onlyNums = value.replace(/\D/g, '');
  if (onlyNums.startsWith('02')) {
    if (onlyNums.length <= 2) return onlyNums;
    if (onlyNums.length <= 5) return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2)}`;
    if (onlyNums.length <= 9) return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2, 5)}-${onlyNums.slice(5)}`;
    return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2, 6)}-${onlyNums.slice(6, 10)}`;
  } else {
    if (onlyNums.length <= 3) return onlyNums;
    if (onlyNums.length <= 6) return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    if (onlyNums.length <= 10) return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 6)}-${onlyNums.slice(6)}`;
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
  }
};
/* --------------------------------------------------------------*/
const formatDateWithDash = (value) => {
  const onlyNums = value.replace(/\D/g, '').slice(0, 6);
  if (onlyNums.length < 3) return onlyNums;
  if (onlyNums.length < 5) return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2)}`;
  return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2, 4)}-${onlyNums.slice(4, 6)}`;
};
/* --------------------------------------------------------------*/
const formatNumberWithCommas = (value) => {
  const num = parseFloat(value.toString().replace(/,/g, ''));
  return isNaN(num) ? '' : num.toLocaleString();
};
/* --------------------------------------------------------------*/
const DeliveryRequest = () => {
  const confirmDelete = () => {
  const updated = requests.filter((_, i) => i !== pendingDeleteIndex);
  setRequests(updated);
  setShowConfirm(false);
  setPendingDeleteIndex(null);
};
/* --------------------------------------------------------------*/
const [showConfirm, setShowConfirm] = useState(false);
const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null); 
/* --------------------------------------------------------------*/ 
const [requests, setRequests] = useState(() => {
  const saved = localStorage.getItem('deliveryRequests');
    return saved ? JSON.parse(saved) : [];
});
/* --------------------------------------------------------------*/
const [form, setForm] = useState({
  date: '', productName: '', spec: '', quantity: '', unitPrice: '',
  warehouseName: '', warehousePhone: '', warehouseFax: '',
  supplierName: '', supplierPhone: '',
  groupOrder: '', completed: false, completedAt: '', memo: '',
  productImage: '', receiptImage: ''
});
/* --------------------------------------------------------------*/
const [searchFilter,setSearchFilter] = useState({
  date: '', productName: '', warehouseName: '', supplierName: ''
});
/* --------------------------------------------------------------*/
const [editIndex, setEditIndex] = useState(null);
/* -------  추가 9/10일  품목입력시 스팩 자동추가------------------------------------------*/
const [specEdited, setSpecEdited] = useState(false);
/* --------------------------------------------------------------*/
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  let formattedValue = value;

    if (name === 'date' && type!=="date") {
    formattedValue = formatDateWithDash(value);
    } else if (['warehousePhone', 'warehouseFax', 'supplierPhone'].includes(name)) {
      formattedValue = formatPhoneNumber(value);
    }

  setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
  }));
 };
/* --------------------------------------------------------------*/
const handleImageChange = (e, field) => {
  const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
};
/* =====================================================================================*/
const handleSubmit = (e) => {
  e.preventDefault();
  if (!form.supplierName || form.supplierName.trim().length < 2) {
  alert("올바른 매입처명을 입력해 주세요.");
  return;
  }
  const newRequest = {
    ...form,
    quantity: parseInt(form.quantity, 10) || 0,
    unitPrice: parseFloat(form.unitPrice.toString().replace(/,/g, '')) || 0,
    groupOrder: parseInt(form.groupOrder, 10) || 0,
    completedAt: form.completed ? new Date().toISOString() : '',
    productImage: form.productImage || (editIndex !== null ? requests[editIndex].productImage : ''),
    receiptImage: form.receiptImage || (editIndex !== null ? requests[editIndex].receiptImage : '')
  };
  if (editIndex !== null) {
    const updated = [...requests];
    updated[editIndex] = newRequest;
    setRequests(updated);
  } 
  else {
    setRequests([...requests, newRequest]);
  }
  setForm({
    date: '', productName: '', spec: '', quantity: '', unitPrice: '',
    warehouseName: '', warehousePhone: '', warehouseFax: '',
    supplierName: '', supplierPhone: '',
    groupOrder: '', completed: false, completedAt: '', memo: '',
     productImage: '', receiptImage: ''
  });
  setEditIndex(null);
};
/* =====================================================================================*/
const handleEdit = (index) => {
  const item = requests[index];
    setForm({
      ...item,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      groupOrder: item.groupOrder.toString(),
      productImage: item.productImage || '',
      receiptImage: item.receiptImage || ''

    });
    setEditIndex(index);
  };
/* --------------------------------------------------------------*/
const handleCancel = () => {
handleCancel
  setForm({
    date: '', productName: '', spec: '', quantity: '', unitPrice: '',
    warehouseName: '', warehousePhone: '', warehouseFax: '',
    supplierName: '', supplierPhone: '',
    groupOrder: '', completed: false, completedAt: '', memo: '',
    productImage: '', receiptImage: ''
  });
  setEditIndex(null);
};
/* --------------------------------------------------------------*/
  const handleDelete = (index) => {
  setPendingDeleteIndex(index);
  setShowConfirm(true);
};  
/* --------------------------------------------------------------*/
useEffect(() => {
    localStorage.setItem('deliveryRequests', JSON.stringify(requests));
  }, [requests]);

  const sortedRequests = requests
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) => (
      (searchFilter.date === '' || item.date === searchFilter.date) &&
      item.productName.toLowerCase().includes(searchFilter.productName.toLowerCase()) &&
      item.warehouseName.toLowerCase().includes(searchFilter.warehouseName.toLowerCase()) &&
      item.supplierName.toLowerCase().includes(searchFilter.supplierName.toLowerCase())
    ))
    .sort((a, b) => a.groupOrder - b.groupOrder);
    useEffect(() => {
  console.log("editIndex 상태:", editIndex);
}, [editIndex]);


/* ------------------------------------------------------------------------- */
useEffect(() => {
  const found = requests.find(r => r.supplierName === form.supplierName);
  if (found) {
    setForm(prev => ({
      ...prev,
      supplierPhone: found.supplierPhone
    }));
  }
}, [form.supplierName, requests]);
/* --------------------------------------------------------*/
useEffect(() => {
  const found = requests.find(r => r.warehouseName === form.warehouseName);
  if (found) {
    setForm(prev => ({
      ...prev,
      warehousePhone: found.warehousePhone,
      warehouseFax: found.warehouseFax
    }));
  }
}, [form.warehouseName, requests]);
/* -------------------------------------------------------- */
useEffect(() => {
  const saved = localStorage.getItem('deliveryRequests');
  if (saved) {
    const parsed = JSON.parse(saved);
    const cleaned = parsed.filter(r => r.supplierName && r.supplierName.length >= 2 && !/[^가-힣a-zA-Z0-9\s]/.test(r.supplierName));
    setRequests(cleaned);
  }
}, []);
/* 날짜 초기화 핸들러 */
const handleClearDate = () => {
  setSearchFilter((prev) => ({ ...prev, date: '' }));
};

// [ADD] 품목이 바뀌면 스펙 자동 채움(사용자가 스펙을 비워둔 경우에만)
useEffect(() => {
  const p = (form.productName || '').trim().toLowerCase();
  if (!p) return;
  if (specEdited) return;                          // 사용자가 스펙을 만진 적 있으면 자동 채움 중단
  if ((form.spec || '').trim()) return;            // 이미 값이 있으면 유지
  const found = [...requests].reverse().find(r =>
    (r.productName || '').trim().toLowerCase() === p &&
    (r.spec || '').trim()
  );
  if (found) setForm(prev => ({ ...prev, spec: found.spec }));
}, [form.productName, specEdited, requests]);

// [ADD] 품목이 바뀌면 사용자 수정 플래그 리셋(새 품목에서 다시 자동 채움 허용)
useEffect(() => { setSpecEdited(false); }, [form.productName]);

/* ==================    본문시작 프로그램 시작         =================================== */
  return (  
  <div className="viewport">
    <div className="page">    {/* ----------   div1 CSS를 Class화   ---------------*/}
    <h2>창고 출고 요청</h2>
{/* --------------------------------------------------------------*/}
<datalist id="supplierNameList">
  {[...new Set(requests.map(r => r.supplierName?.trim()))]
    .filter(name =>
      name &&
      name.length >= 2 &&
      !/[^가-힣a-zA-Z0-9\s]/.test(name)  // 특수문자 제거
    )
    .map((name, i) => <option key={i} value={name} />)}
</datalist>
{/* --------------------------------------------------------------*/}
<datalist id="productNameList">
  {[...new Set(requests.map((r) => r.productName))]
    .filter(Boolean)
    .map((name, i) => <option key={i} value={name} />)}
</datalist>
{/* ------------------------------------------------------*/}
<datalist id="warehouseNameList">
  {[...new Set(requests.map((r) => r.warehouseName))].filter(Boolean).map((name, i) => (
    <option key={i} value={name} />
  ))}
</datalist>
{/* --------   9/10 추가 품목입력시 자동추가  -----------------------------------*/}
<datalist id="specList">
  {[...new Set(
    requests
      .filter(r => (r.productName || '').trim().toLowerCase() === (form.productName || '').trim().toLowerCase())
      .map(r => r.spec)
      .filter(Boolean)
  )].map((s, i) => <option key={i} value={s} />)}
</datalist>
{/* ------------------------------------------------------*/}

<form className="table-wrap" onSubmit={handleSubmit} > {/* ----   form1   grid1   -----------------------------------*/}
  <table className="grid">
  <colgroup>
    <col className="w-order"/><col className="w-done"/><col className="w-date"/>
    <col className="w-name"/><col className="w-spec"/><col className="w-qty"/>
    <col className="w-price"/><col className="w-whname"/><col className="w-whphone"/>
    <col className="w-whfax"/><col className="w-supp"/><col className="w-sphone"/>
    <col className="w-receipt"/><col className="w-product"/><col className="w-memo"/>
  </colgroup>      
    <thead className="thead1">      
      <tr>  
        <th style={{ border: '1px solid #000' }}>순번</th>
        <th style={{ border: '1px solid #000' }}>완료</th>
        <th style={{ border: '1px solid #000' }}>날짜</th>
        <th style={{ border: '1px solid #000' }}>품목</th>
        <th style={{ border: '1px solid #000' }}>규격</th>
        <th style={{ border: '1px solid #000' }}>수량</th>
        <th style={{ border: '1px solid #000' }}>단가</th>
        <th style={{ border: '1px solid #000' }}>창고명</th>
        <th style={{ border: '1px solid #000' }}>전화</th>
        <th style={{ border: '1px solid #000' }}>팩스</th>
        <th style={{ border: '1px solid #000' }}>매입처</th>
        <th style={{ border: '1px solid #000' }}>연락처</th>
        <th style={{ border: '1px solid #000' }}>출고증</th>
        <th style={{ border: '1px solid #000' }}>제품픽</th>
        <th style={{ border: '1px solid #000' }}>비고</th>
      </tr>
    </thead>  

    {/* ======    입력파트   tbody1s  =======================-*/}
    <tbody>     
      <tr>      
        <td><input name="groupOrder" type="number" value={form.groupOrder} onChange={handleChange} 
        style={{width:'100px'}}/></td>
        <td><input name="completed" type="checkbox" checked={form.completed} onChange={handleChange} /></td>
        <td><input name="date" type="date" value={form.date} onChange={handleChange}  /></td>

        <td><input name="productName" 
              list={form.productName?.length ? 'productNameList' : undefined}
              autoComplete="off" value={form.productName} onChange={handleChange}/></td>

        <td><input name="spec" 
              list={form.spec?.length ? 'specList' : undefined}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              value={form.spec} onChange={handleChange}/></td>

        <td><input name="quantity" list={form.quantity?.length ? 'quantityList' : undefined}
            value={form.quantity} onChange={handleChange} style={{width:'50px'}} /></td>
        <td><input
          name="unitPrice" 
          value={formatNumberWithCommas(form.unitPrice)}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '');
            if (!isNaN(raw)) setForm((prev) => ({ ...prev, unitPrice: raw }));
          }}
          
        /></td> 
        <td><input name="warehouseName"list="warehouseNameList" value={form.warehouseName} onChange={handleChange}
          /></td>
        <td><input name="warehousePhone" value={form.warehousePhone} onChange={handleChange} 
         /></td>
        <td><input name="warehouseFax" value={form.warehouseFax} onChange={handleChange} 
         /></td>
        <td><input name="supplierName"list="supplierNameList" value={form.supplierName} onChange={handleChange}
           /></td>
        <td><input name="supplierPhone" value={form.supplierPhone} onChange={handleChange}  style={{width:'90px'}}/></td>
        <td><label style={{display: 'inline-block', background: '#f0f0f0', border: '1px solid #ccc', 
        padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' 
  }}>
    사진
    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageChange(e, 'receiptImage')} style={{ display: 'none' }}/>
  </label></td>
        <td><label style={{display: 'inline-block', background: '#f0f0f0', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
    fontSize: '12px' 
  }}>
    사진
    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageChange(e, 'productImage')} 
    style={{ display: 'none'  }} />
  </label></td>
        <td><textarea name="memo" value={form.memo} onChange={handleChange} style={{width:'80px'}} /></td>
      </tr> 
    </tbody> 
  </table>  
{/* ---------------table1-----------------------------------------------*/}

{/*=========== 수정완료/ 출고등록  div.div4  ==================================== */}
  <div className ="table-wrap">
    <button type="submit"> {editIndex !== null ? '수정 완료' : '출고 등록'} </button>
    <button id = "btn1" type="button" onClick={handleCancel}>입력 취소</button>
  </div>
</form>
{/* ============================================================================= */}

{/* ---------------  form2  조회파트(찾기)   --------------------------------------*/}
 <h3 style={{ marginTop: '30px' }}>출고 목록 (순번 정렬)</h3>
{/*----------------   div3 조회항목  ---------------------------- */}
<div className="table-wrap">    
  <input type="date" placeholder="YY-MM-DD" value={searchFilter.date} onChange={(e) => setSearchFilter({ ...searchFilter, date: e.target.value })} />
  {/* 날짜 초기화 버튼 */}
  <button type="button" className="btn-reset-date" onClick={handleClearDate}>초기화</button>
  <input type="text" placeholder="품목" value={searchFilter.productName} onChange={(e) => setSearchFilter({ ...searchFilter, productName: e.target.value })} />
  <input type="text" placeholder="창고명" value={searchFilter.warehouseName} onChange={(e) => setSearchFilter({ ...searchFilter, warehouseName: e.target.value })} />
  <input type="text" placeholder="매입처" value={searchFilter.supplierName} onChange={(e) => setSearchFilter({ ...searchFilter, supplierName: e.target.value })} />

{/* 데이터저장파트 및 불러오기 버튼 */}
{/* ---  저장파트   ------ */}
{/*
   <button onClick={() => exportJson(requests, 'deliveryRequests.json')}>저장하기</button>
   */}
*<button
    onClick={() => {
      const blob = new Blob([JSON.stringify(requests, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deliveryRequests.json';
      a.click();
      URL.revokeObjectURL(url);
    }}>저장하기</button>

  {/* ---  불러오기 파트   ------ */}
  <input
    type="file"
    accept="application/json"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          setRequests(data);
        } catch {
          alert('불러오기에 실패했습니다.');
        }
      };
      reader.readAsText(file);
    }}
  />
  
  
</div> {/* ---------------  div3e  -----------------------------------------------*/}

{/* 목록테이블 파트 ------   grid2  div4s   ---------------------*/}
<div className="table-wrap"> 
  <table className="grid2"> 
   <colgroup>
    <col className="w-order2"/><col className="w-date2"/><col className="w-name2"/>
    <col className="w-spec2"/><col className="w-qty2"/><col className="w-price2"/>
    <col className="w-whname2"/><col className="w-whphone2"/><col className="w-whfax2"/>
    <col className="w-supp2"/><col className="w-sphone2"/>
    <col className="w-receipt2"/><col className="w-product2"/>
    <col className="w-memo2"/><col className="w-done2"/>
    <col className="w-edit2"/>
  </colgroup>  
    <thead> 
      <tr>  
        <th>순번</th>
        <th>날짜</th>
        <th>품목</th>
        <th>규격</th>
        <th>수량</th>
        <th>단가</th>
        <th>창고명</th>
        <th>창고 전화</th>
        <th>창고 팩스</th>
        <th>매입처</th>
        <th>매입처 전화</th>
        <th>제품픽</th>
        <th>출고증</th>
        <th>비고</th>
        <th>완료</th>
        <th>수정/삭제</th>
      </tr>           
    </thead>      
  <tbody> 
      {sortedRequests
  .sort((a, b) => {
    if (a.date === b.date) return a.groupOrder - b.groupOrder;
    return b.date.localeCompare(a.date); // 최신 날짜가 위로
  })
    .map((req, idx) => (

        <tr key={idx}>  
          <td>{req.groupOrder}</td>
          <td>{req.date?.slice(5).replace('-', '/')}</td>
          <td>{req.productName}</td>
          <td>{req.spec}</td>
          <td>{req.quantity}</td>
          <td>{req.unitPrice.toLocaleString()}</td>
          <td>{req.warehouseName}</td>
          <td>{req.warehousePhone}</td>
          <td>{req.warehouseFax}</td>
          <td>{req.supplierName}</td>
          <td>{req.supplierPhone}</td>
          <td>{req.productImage && <img src={req.productImage} alt="제품픽" style={{ width: '60px' }} />}</td>
          <td>{req.receiptImage && <img src={req.receiptImage} alt="출고증" style={{ width: '60px' }} />}</td>
          <td>{req.memo}</td>
          <td>{req.completed ? '✅' : ''}</td>
          <td>
            <button onClick={() => handleEdit(req.originalIndex)}>수정</button>
            <button onClick={() => handleDelete(req.originalIndex)}>삭제</button>
          </td>
        </tr> 
      ))}
    </tbody>  
  </table> 
</div> 

{/* ======================   삭제 확인 모달  div5s =================================  */}
{showConfirm && (  
  <div className ="div5">    
    <p>정말 삭제하시겠습니까?</p>
    <button onClick={confirmDelete}>삭제</button>
    <button onClick={() => setShowConfirm(false)}>취소</button>
  </div>                    
)}      {/* ----------------   div5e  -----------------------*/} 
</div>
</div>    
  )};

export default DeliveryRequest;