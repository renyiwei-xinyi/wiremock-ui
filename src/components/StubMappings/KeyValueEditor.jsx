import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Button } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';

const KeyValueEditor = ({ value = {}, onChange, placeholder }) => {
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    const entries = Object.entries(value || {});
    if (entries.length === 0) {
      setPairs([{ key: '', value: '', id: Math.random() }]);
    } else {
      setPairs(entries.map(([key, val]) => ({ key, value: val, id: Math.random() })));
    }
  }, [value]);

  const handleChange = (newPairs) => {
    setPairs(newPairs);
    const obj = {};
    newPairs.forEach(pair => {
      if (pair.key && pair.key.trim()) {
        // 支持空值，但键不能为空
        obj[pair.key.trim()] = pair.value || '';
      }
    });
    onChange?.(obj);
  };

  const addPair = () => {
    handleChange([...pairs, { key: '', value: '', id: Math.random() }]);
  };

  const removePair = (id) => {
    handleChange(pairs.filter(pair => pair.id !== id));
  };

  const updatePair = (id, field, newValue) => {
    handleChange(pairs.map(pair => 
      pair.id === id ? { ...pair, [field]: newValue } : pair
    ));
  };

  return (
    <div>
      {pairs.map((pair) => (
        <Row key={pair.id} gutter={8} style={{ marginBottom: 8 }}>
          <Col span={10}>
            <Input
              placeholder="键"
              value={pair.key}
              onChange={(e) => updatePair(pair.id, 'key', e.target.value)}
            />
          </Col>
          <Col span={12}>
            <Input
              placeholder="值"
              value={pair.value}
              onChange={(e) => updatePair(pair.id, 'value', e.target.value)}
            />
          </Col>
          <Col span={2}>
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => removePair(pair.id)}
            />
          </Col>
        </Row>
      ))}
      <Button type="dashed" onClick={addPair} block>
        添加 {placeholder || '键值对'}
      </Button>
    </div>
  );
};

export default KeyValueEditor;
