import React, { useState, useEffect } from 'react';
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
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { useLocation } from 'react-router-dom';

const { Option } = Select;

const BusinessConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [slotDuration, setSlotDuration] = useState(30);
  const [slotPrice, setSlotPrice] = useState(0.0);
  const [weeklyHours, setWeeklyHours] = useState([]);
  const [selectedTemplateDay, setSelectedTemplateDay] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [savedConfig, setSavedConfig] = useState(null);
  const [stripeAccountStatus, setStripeAccountStatus] = useState(null);
  const token = localStorage.getItem('token');
  const location = useLocation();
  const { id} = location.state || {};
  const businessId=id;
  
  const navigate = useNavigate();

  useEffect(() => {
    const defaultHours = Array(7).fill().map((_, day) => ({
      dayOfWeek: day,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: day === 0 || day === 6
    }));
    setWeeklyHours(defaultHours);
    loadExistingConfig();
    checkStripeAccountStatus();
  }, []);

  const authAxios = axios.create({
    baseURL: `${API_BASE_URL}/api`,
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
        setSlotPrice(response.data.slotPrice || 0.0);
      }
    } catch (error) {
      console.log('No existing configuration found:', error);
    }
  };

  const checkStripeAccountStatus = async () => {
    try {
      const response = await authAxios.get(`/stripe-connect/account-status/${businessId}`);
      setStripeAccountStatus(response.data);
    } catch (error) {
      console.error('Error checking Stripe account status:', error);
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
        slotPrice: slotPrice,
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
    <div className="business-config">
      <div className="business-config__content">
        <Card 
          title="Business Hours Configuration" 
          className="business-config__card"
          extra={
            <div className="business-config__template-controls">
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
          <div className="business-config__hours-grid">
            {weeklyHours.map((day, index) => (
              <div key={index} className={`business-config__day-card ${day.isClosed ? 'business-config__day-card--closed' : ''}`}>
                <div className="business-config__day-header">
                  <Switch
                    checked={!day.isClosed}
                    onChange={(checked) => updateDayHours(index, 'isClosed', !checked)}
                  />
                  <span className="business-config__day-name">
                    {getDayName(index)}
                  </span>
                </div>

                {!day.isClosed && (
                  <div className="business-config__time-inputs">
                    <TimePicker
                      format="HH:mm"
                      minuteStep={15}
                      value={day.openTime ? moment(day.openTime, 'HH:mm') : null}
                      onChange={(time) => updateDayHours(index, 'openTime', time ? time.format('HH:mm') : null)}
                      className="business-config__time-picker"
                    />
                    <span className="business-config__time-separator">to</span>
                    <TimePicker
                      format="HH:mm"
                      minuteStep={15}
                      value={day.closeTime ? moment(day.closeTime, 'HH:mm') : null}
                      onChange={(time) => updateDayHours(index, 'closeTime', time ? time.format('HH:mm') : null)}
                      className="business-config__time-picker"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Slot Configuration" className="business-config__card">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="maxSlotsPerInterval"
                  label="Max Slots Per Interval"
                  rules={[{
                    required: true,
                    message: 'Please enter max slots per interval'
                  }]}
                >
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter number"
                    style={{
                      width: '100%',
                      padding: '8px 11px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
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
              <Col span={8}>
                <Form.Item label="Slot Price ($)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={slotPrice}
                    onChange={(e) => setSlotPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Enter price per slot"
                    style={{
                      width: '100%',
                      padding: '8px 11px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <div style={{ 
                    marginTop: '4px', 
                    fontSize: '12px', 
                    color: '#666',
                    fontStyle: 'italic' 
                  }}>
                    Current price: <strong>${slotPrice?.toFixed(2) || '0.00'}</strong> per slot
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card 
          title={
            <span>
              <CreditCardOutlined style={{ marginRight: 8 }} />
              Payment Setup
            </span>
          } 
          className="business-config__card"
        >
          {stripeAccountStatus ? (
            <div className="business-config__payment-status">
              {!stripeAccountStatus.hasStripeAccount ? (
                <div className="business-config__payment-not-setup">
                  <p>Set up payments to receive money from customer bookings directly to your bank account.</p>
                  <Button 
                    type="primary" 
                    icon={<CreditCardOutlined />}
                    onClick={() => navigate(`/stripe-onboarding/${businessId}`)}
                  >
                    Set Up Payments
                  </Button>
                </div>
              ) : (
                <div className="business-config__payment-setup">
                  <div className="business-config__status-items">
                    <div className={`business-config__status-item ${stripeAccountStatus.onboardingCompleted ? 'business-config__status-item--completed' : 'business-config__status-item--pending'}`}>
                      <span className="business-config__status-icon">
                        {stripeAccountStatus.onboardingCompleted ? '✅' : '🔄'}
                      </span>
                      <span>Account Setup: {stripeAccountStatus.onboardingCompleted ? 'Complete' : 'Pending'}</span>
                    </div>
                    
                    <div className={`business-config__status-item ${stripeAccountStatus.chargesEnabled ? 'business-config__status-item--completed' : 'business-config__status-item--pending'}`}>
                      <span className="business-config__status-icon">
                        {stripeAccountStatus.chargesEnabled ? '✅' : '🔄'}
                      </span>
                      <span>Receiving Payments: {stripeAccountStatus.chargesEnabled ? 'Enabled' : 'Pending'}</span>
                    </div>
                    
                    <div className={`business-config__status-item ${stripeAccountStatus.payoutsEnabled ? 'business-config__status-item--completed' : 'business-config__status-item--pending'}`}>
                      <span className="business-config__status-icon">
                        {stripeAccountStatus.payoutsEnabled ? '✅' : '🔄'}
                      </span>
                      <span>Bank Transfers: {stripeAccountStatus.payoutsEnabled ? 'Enabled' : 'Pending'}</span>
                    </div>
                  </div>

                  {stripeAccountStatus.onboardingCompleted && stripeAccountStatus.chargesEnabled ? (
                    <div className="business-config__payment-active">
                      <Tag color="success" style={{ marginRight: 8 }}>
                        <CheckCircleOutlined /> Payment Active
                      </Tag>
                      <span>You're ready to receive payments!</span>
                    </div>
                  ) : (
                    <Button 
                      type="primary" 
                      onClick={() => navigate(`/stripe-onboarding/${businessId}`)}
                    >
                      Complete Payment Setup
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading payment status...
            </div>
          )}
        </Card>

        <div className="business-config__action-bar">
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
          open={successModalVisible}
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
            <div className="business-config__success-summary">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Saved At">{savedConfig.timestamp}</Descriptions.Item>
                
                <Descriptions.Item label="Business Hours">
                  <div className="business-config__business-hours-summary">
                    {savedConfig.businessHours.map((day, index) => (
                      <div key={index} className="business-config__day-summary">
                        <span className="business-config__day-name">{getDayName(day.dayOfWeek)}:</span>
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
    </div>
  );
};

export default BusinessConfig;