import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { authApi } from '@/lib/api';
import Button from '../ui/Button';
import Input from '../ui/Input';

const schema = yup.object().shape({
  firstName: yup.string().required('Ім\'я є обов\'язковим'),
  lastName: yup.string().required('Прізвище є обов\'язковим'),
  email: yup.string().email('Введіть коректну email адресу').required('Email є обов\'язковим'),
  password: yup.string()
    .required('Пароль є обов\'язковим')
    .min(8, 'Пароль має містити не менше 8 символів')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Пароль повинен містити букви та цифри'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Паролі повинні співпадати')
    .required('Підтвердження паролю є обов\'язковим'),
});

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpForm() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Видаляємо confirmPassword з даних для API
      const { confirmPassword, ...apiData } = data;
      
      await authApi.signup(apiData);
      router.push('/auth/signin?registered=true');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t('signUp.errors.general'));
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label={t('signUp.firstName')}
          {...register('firstName')}
          error={errors.firstName?.message}
          fullWidth
        />
        
        <Input
          label={t('signUp.lastName')}
          {...register('lastName')}
          error={errors.lastName?.message}
          fullWidth
        />
      </div>
      
      <Input
        label={t('signUp.email')}
        type="email"
        {...register('email')}
        error={errors.email?.message}
        leftIcon={(
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        )}
        fullWidth
      />
      
      <Input
        label={t('signUp.password')}
        type="password"
        {...register('password')}
        error={errors.password?.message}
        leftIcon={(
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
        fullWidth
      />
      
      <Input
        label={t('signUp.confirmPassword')}
        type="password"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
        leftIcon={(
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
        fullWidth
      />
      
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        fullWidth
      >
        {t('signUp.submit')}
      </Button>
    </form>
  );
}
