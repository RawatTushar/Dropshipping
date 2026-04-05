import React, { useState } from "react";
import '../login.css';
import hideIcon from "../assets/images/hide.png";
import viewIcon from "../assets/images/view.png";

const HideAndShow = ({ value, onChange, name, placeholder , label,isshownalways}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        <input
          type={show ? "text" : "password"}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          style={{
            width: '100%',
            paddingRight: '45px',
            boxSizing: 'border-box'
          }}
        />
        { !isshownalways && 
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px'
          }}
        >
          <img
            src={show ? hideIcon : viewIcon}
            alt={show ? "Hide password" : "Show password"}
            style={{
              width: '20px',
              height: '20px',
              pointerEvents: 'none'
            }}
          
          />

        </button>
          }
      </div>
    </div>
  );
};

export default HideAndShow;