import { describe, it, expect, vi } from 'vitest';
import { runViewAction } from './view-actions';

describe('Prototype action migration', () => {
  it('dispatches actions with arguments and event methods', () => {
    const go = vi.fn();
    const preventDefault = vi.fn();
    runViewAction("event.preventDefault();go('payslips');", { go }, null, { preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(go).toHaveBeenCalledWith('payslips');
  });
  it('updates state from an input before refreshing the view', () => {
    const state = { employeeSearch: '' };
    const render = vi.fn();
    const input = document.createElement('input');
    input.value = 'Nkosi';
    runViewAction('state.employeeSearch=this.value;render();', { state, render }, input, {});
    expect(state.employeeSearch).toBe('Nkosi');
    expect(render).toHaveBeenCalledOnce();
  });
  it('supports conditional custom-role field visibility', () => {
    const field = document.createElement('div');
    field.id = 'custom-role';
    document.body.append(field);
    const input = document.createElement('select');
    input.innerHTML = '<option value="__custom__">Custom</option>';
    runViewAction("if(this.value==='__custom__'){document.getElementById('custom-role').style.display='block';}else{document.getElementById('custom-role').style.display='none';}", {}, input, {});
    expect(field.style.display).toBe('block');
    field.remove();
  });
});