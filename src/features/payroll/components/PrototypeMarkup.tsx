import { createElement, type ReactNode } from 'react';
import parse, { attributesToProps, domToReact, Element, type HTMLReactParserOptions, type DOMNode } from 'html-react-parser';
import { Button } from 'antd';
import { runViewAction } from '../view-actions';

export function PrototypeMarkup({ html, actions }: { html: string; actions: Record<string, unknown> }) {
  const options: HTMLReactParserOptions = {
    replace(dom) {
      if (!(dom instanceof Element)) return;
      const attributes = { ...dom.attribs };
      const handlers: Record<string, unknown> = {};
      for (const [attribute, eventName] of [['onclick', 'onClick'], ['onchange', 'onChange'], ['oninput', 'onChange']] as const) {
        const source = attributes[attribute];
        if (source) {
          handlers[eventName] = (event: { currentTarget: EventTarget; nativeEvent: Event }) => runViewAction(source, actions, event.currentTarget, event.nativeEvent);
          delete attributes[attribute];
        }
      }
      const props: Record<string, unknown> = { ...attributesToProps(attributes), ...handlers };
      const children = domToReact(dom.children as DOMNode[], options);
      if (dom.name === 'button') return <Button {...props} type="text" className={`payroll-button ${attributes['class'] ?? ''}`} htmlType="button">{children}</Button>;
      if (dom.name === 'input') {
        const inputProps = props as Record<string, unknown>;
        if ('value' in inputProps) { inputProps['defaultValue'] = inputProps['value']; delete inputProps['value']; }
        if ('checked' in inputProps) { inputProps['defaultChecked'] = inputProps['checked']; delete inputProps['checked']; }
        return createElement('input', { ...inputProps, key: `${attributes['id'] ?? ''}-${attributes['value'] ?? ''}-${attributes['checked'] ?? ''}` });
      }
      if (dom.name === 'select') {
        const selected = dom.children.find(child => child instanceof Element && 'selected' in child.attribs);
        if (selected instanceof Element) props['defaultValue'] = selected.attribs['value'] ?? selected.children.map(child => 'data' in child ? child.data : '').join('');
        return createElement('select', { ...props, key: `${attributes['id'] ?? ''}-${String(props['defaultValue'] ?? '')}` }, children);
      }
      if (dom.name === 'option') { delete props['selected']; return createElement('option', props, children); }
      if (dom.name === 'table') return <div className="table-scroll">{createElement('table', props, children)}</div>;
      if (['br', 'hr', 'img', 'wbr', 'area', 'base', 'col', 'embed', 'link', 'meta', 'param', 'source', 'track'].includes(dom.name)) return createElement(dom.name, props);
      if (handlers['onClick'] && !['tr', 'td', 'a'].includes(dom.name)) {
        props['role'] = 'button'; props['tabIndex'] = 0;
        props['onKeyDown'] = (event: { key: string; currentTarget: EventTarget; nativeEvent: Event; preventDefault: () => void }) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); runViewAction(dom.attribs['onclick'] ?? '', actions, event.currentTarget, event.nativeEvent); } };
      }
      return createElement(dom.name, props, children as ReactNode);
    },
  };
  return <>{parse(html, options)}</>;
}