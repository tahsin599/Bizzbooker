import React, { useState, useEffect, use } from 'react';
import { 
  Button, 
  Card, 
  TimePicker, 
  Select, 
  Switch, 
  Form, 
  Row, 
  Col, 
  message, 
  Popconfirm, 
  Modal,
  Descriptions,
  Tag
} from 'antd';
import axios from 'axios';
import './BusinessConfig.css';
import moment from 'moment';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { Option } = Select;

const BusinessConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [slotDuration, setSlotDuration] = useState(30);
  const [weeklyHours, setWeeklyHours] = useState([]);
  const [selectedTemplateDay, setSelectedTemplateDay] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [savedConfig, setSavedConfig] = useState(null);
  const token = localStorage.getItem('token');
  const businessId = useParams().businessId; // Assuming you're using react-router v6

  // Initialize with default hours
  useEffect(() => {
    const defaultHours = Array(7).fill().map((_, day) => ({
      dayOfWeek: day,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: day === 0 || day === 6
    }));
    setWeeklyHours(defaultHours);
    loadExistingConfig();
  }, []);

  const authAxios = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const loadExistingConfig = async () => {
    try {
      const response = await authAxios.get(`/slot-config/location/${businessId}`);
      if (response.data) {
        form.setFieldsValue({
          maxSlotsPerInterval: response.data.maxSlotsPerInterval
        });
        setSlotDuration(response.data.slotDuration);
      }
    } catch (error) {
      console.log('No existing configuration found:', error);
    }
  };

  const applyToAllOpenDays = () => {
    if (selectedTemplateDay === null) {
      message.warning('Please select a day to copy settings from');
      return;
    }

    const template = weeklyHours[selectedTemplateDay];
    if (template.isClosed) {
      message.warning('Cannot apply closed day settings to other days');
      return;
    }

    setWeeklyHours(prevHours => 
      prevHours.map((day, index) => {
        if (index === selectedTemplateDay || day.isClosed) return day;
        return {
          ...day,
          openTime: template.openTime,
          closeTime: template.closeTime
        };
      })
    );
    message.success(`Applied ${getDayName(selectedTemplateDay)}'s hours to all open days`);
  };

  const getDayName = (index) => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index];
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      let earliestStart = "23:59:59";
      let latestEnd = "00:00:00";

      const businessHoursPayload = weeklyHours.map(day => {
        if (day.isClosed) {
          return {
            dayOfWeek: day.dayOfWeek,
            openTime: "00:00:00",
            closeTime: "00:00:00",
            isClosed: true
          };
        }

        const openTime = `${day.openTime}:00`;
        const closeTime = `${day.closeTime}:00`;

        if (openTime < earliestStart) earliestStart = openTime;
        if (closeTime > latestEnd) latestEnd = closeTime;

        return {
          dayOfWeek: day.dayOfWeek,
          openTime,
          closeTime,
          isClosed: false
        };
      });

      const slotConfigPayload = {
        locationId: businessId,
        maxSlotsPerInterval: values.maxSlotsPerInterval,
        slotDuration: slotDuration,
        startTime: earliestStart,
        endTime: latestEnd
      };

      await authAxios.post(`/business-hours/${businessId}/weekly`, businessHoursPayload);
      await authAxios.post('/slot-config', slotConfigPayload);
      
      setSavedConfig({
        businessHours: businessHoursPayload,
        slotConfig: slotConfigPayload,
        timestamp: new Date().toLocaleString()
      });
      
      setSuccessModalVisible(true);
      message.success('Configuration saved successfully!');
      
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateDayHours = (day, field, value) => {
    const updated = [...weeklyHours];
    updated[day] = { ...updated[day], [field]: value };
    setWeeklyHours(updated);
  };

  const renderDayStatus = (day) => {
    if (day.isClosed) {
      return <Tag icon={<CloseCircleOutlined />} color="error">Closed</Tag>;
    }
    return (
      <Tag icon={<ClockCircleOutlined />} color="processing">
        {day.openTime} - {day.closeTime}
      </Tag>
    );
  };

  return (
    <div className="business-config-container">
      <Card 
        title="Business Hours Configuration" 
        className="config-card"
        extra={
          <div className="template-controls">
            <Select
              placeholder="Select day to copy"
              style={{ width: 150, marginRight: 10 }}
              onChange={setSelectedTemplateDay}
              value={selectedTemplateDay}
            >
              {weeklyHours.map((day, index) => (
                <Option key={index} value={index} disabled={day.isClosed}>
                  {getDayName(index)}
                </Option>
              ))}
            </Select>
            <Popconfirm
              title="Are you sure you want to apply these hours to all open days?"
              onConfirm={applyToAllOpenDays}
              okText="Yes"
              cancelText="No"
              disabled={selectedTemplateDay === null}
            >
              <Button 
                type="dashed" 
                disabled={selectedTemplateDay === null}
              >
                Apply to All Open Days
              </Button>
            </Popconfirm>
          </div>
        }
      >
        <div className="hours-grid">
          {weeklyHours.map((day, index) => (
            <div key={index} className={`day-card ${day.isClosed ? 'closed' : ''}`}>
              <div className="day-header">
                <Switch
                  checked={!day.isClosed}
                  onChange={(checked) => updateDayHours(index, 'isClosed', !checked)}
                />
                <span className="day-name">
                  {getDayName(index)}
                </span>
              </div>

              {!day.isClosed && (
                <div className="time-inputs">
                  <TimePicker
                    format="HH:mm"
                    minuteStep={15}
                    value={day.openTime ? moment(day.openTime, 'HH:mm') : null}
                    onChange={(time) => updateDayHours(index, 'openTime', time ? time.format('HH:mm') : null)}
                    className="time-picker"
                  />
                  <span className="time-separator">to</span>
                  <TimePicker
                    format="HH:mm"
                    minuteStep={15}
                    value={day.closeTime ? moment(day.closeTime, 'HH:mm') : null}
                    onChange={(time) => updateDayHours(index, 'closeTime', time ? time.format('HH:mm') : null)}
                    className="time-picker"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Slot Configuration" className="config-card">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="maxSlotsPerInterval"
                label="Max Slots Per Interval"
                initialValue={3}
                rules={[{
                  required: true,
                  message: 'Please select max slots per interval'
                }]}
              >
                <Select>
                  {[1, 2, 3, 4, 5].map(num => (
                    <Option key={num} value={num}>{num}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Slot Duration (minutes)">
                <Select
                  value={slotDuration}
                  onChange={setSlotDuration}
                >
                  {[15, 30, 45, 60].map(duration => (
                    <Option key={duration} value={duration}>{duration}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <div className="action-bar">
        <Button
          type="primary"
          size="large"
          onClick={handleSave}
          loading={loading}
          icon={<CheckCircleOutlined />}
        >
          Save Configuration
        </Button>
      </div>

      <Modal
        title={<><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />Configuration Saved Successfully!</>}
        visible={successModalVisible}
        onOk={() => setSuccessModalVisible(false)}
        onCancel={() => setSuccessModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSuccessModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            onClick={() => window.print()}
          >
            Print Summary
          </Button>
        ]}
        width={700}
      >
        {savedConfig && (
          <div className="success-summary">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Saved At">{savedConfig.timestamp}</Descriptions.Item>
              
              <Descriptions.Item label="Business Hours">
                <div className="business-hours-summary">
                  {savedConfig.businessHours.map((day, index) => (
                    <div key={index} className="day-summary">
                      <span className="day-name">{getDayName(day.dayOfWeek)}:</span>
                      {renderDayStatus(day)}
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Slot Duration">
                <Tag color="blue">{savedConfig.slotConfig.slotDuration} minutes</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Max Slots Per Interval">
                <Tag color="blue">{savedConfig.slotConfig.maxSlotsPerInterval}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Operating Hours">
                <Tag color="geekblue">
                  {savedConfig.slotConfig.startTime} - {savedConfig.slotConfig.endTime}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BusinessConfig;