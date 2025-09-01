import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    post: jest.fn()
  }))
}));

// 模拟localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

const mockAxiosInstance = axios.create();

describe('LoginPage组件测试', () => {
  let mockOnLogin;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnLogin = jest.fn();
  });

  test('LoginPage能够正确渲染所有表单元素', () => {
    render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    // 验证表单元素是否存在
    expect(screen.getByPlaceholderText('请输入学号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    expect(screen.getByLabelText('记住我')).toBeInTheDocument();
    expect(screen.getByText('立即登录')).toBeInTheDocument();
    expect(screen.getByText('忘记密码？')).toBeInTheDocument();
    expect(screen.getByText('立即注册')).toBeInTheDocument();
  });

  test('表单验证能正确工作 - 空学号和密码', async () => {
    render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    // 点击登录按钮
    fireEvent.click(screen.getByText('立即登录'));

    // 验证错误提示
    await waitFor(() => {
      expect(screen.getByText('请输入学号')).toBeInTheDocument();
      expect(screen.getByText('请输入密码')).toBeInTheDocument();
    });

    // 验证没有调用登录API
    expect(mockAxiosInstance.post).not.toHaveBeenCalled();
  });

  test('表单验证能正确工作 - 密码长度不足', async () => {
    render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    // 输入学号和短密码
    fireEvent.change(screen.getByPlaceholderText('请输入学号'), { target: { value: '20210001' } });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), { target: { value: '123' } });

    // 点击登录按钮
    fireEvent.click(screen.getByText('立即登录'));

    // 验证错误提示
    await waitFor(() => {
      expect(screen.getByText('密码长度不能少于6位')).toBeInTheDocument();
    });

    // 验证没有调用登录API
    expect(mockAxiosInstance.post).not.toHaveBeenCalled();
  });

  test('登录成功能正确处理', async () => {
    const mockToken = 'test-token-123';
    const mockUser = { id: 1, student_id: '20210001', username: '测试用户' };
    
    // Mock成功响应
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { token: mockToken, user: mockUser }
    });

    render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    // 输入正确的学号和密码
    fireEvent.change(screen.getByPlaceholderText('请输入学号'), { target: { value: '20210001' } });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), { target: { value: '12345678' } });

    // 点击登录按钮
    fireEvent.click(screen.getByText('立即登录'));

    // 验证调用了登录API
    await waitFor(() => {
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/users/login/', {
        student_id: '20210001',
        password: '12345678'
      });
    });

    // 验证调用了onLogin回调
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockToken, mockUser);
    });
  });

  test('登录失败能正确处理', async () => {
    // Mock失败响应
    mockAxiosInstance.post.mockRejectedValueOnce({
      response: {
        data: { non_field_errors: ['学号或密码错误'] }
      }
    });

    render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    // 输入学号和密码
    fireEvent.change(screen.getByPlaceholderText('请输入学号'), { target: { value: '20210001' } });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), { target: { value: 'wrongpassword' } });

    // 点击登录按钮
    fireEvent.click(screen.getByText('立即登录'));

    // 验证错误提示
    await waitFor(() => {
      expect(screen.getByText('学号或密码错误')).toBeInTheDocument();
    });
  });
});