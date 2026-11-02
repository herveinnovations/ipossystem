import React from 'react';
import Wordmark from './Wordmark';
import {Link} from 'react-router-dom';
export default function Brand({className=''}){return <Link to="/" className={'brand '+className} aria-label="iPOS home"><span className="brand-icon"><img src="/ipos-logo.png?v=23670b6cd135" alt=""/></span><Wordmark/></Link>}
