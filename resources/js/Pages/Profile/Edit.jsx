import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import TextInput from '../../Components/Forms/TextInput';
import {
    ProfileCard,
    ProfilePageHeader,
    ProfileSuccessBanner,
    ProfileFieldRow,
    ProfileFormActions,
    ProfilePasswordCard,
} from '../../Components/Profile';

const ACCOUNT_TYPE_LABELS = {
    admin:      'Administrator',
    superadmin: 'Super Administrator',
};

const Edit = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        name:  user.name  ?? '',
        email: user.email ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/profile', { onSuccess: () => setIsEditing(false) });
    };

    const handleCancel = () => { reset(); setIsEditing(false); };

    return (
        <AppLayout title="Profile Settings">
            <div className="max-w-3xl mx-auto p-6 space-y-6">

                <ProfilePageHeader
                    title="Profile Settings"
                    subtitle="Manage your account information"
                    isEditing={isEditing}
                    onEdit={() => setIsEditing(true)}
                />

                <ProfileSuccessBanner show={recentlySuccessful} />

                <ProfileCard heading="Account Identity">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ProfileFieldRow
                            label="Account Type"
                            value={ACCOUNT_TYPE_LABELS[user.account_type] ?? user.account_type}
                        />
                        <ProfileFieldRow
                            label="Account ID"
                            value={`#${user.id}`}
                        />
                    </div>
                </ProfileCard>

                <ProfileCard heading="Account Details">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <TextInput
                                label="Name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                            <TextInput
                                label="Email Address"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />
                            <ProfileFormActions processing={processing} onCancel={handleCancel} />
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <ProfileFieldRow label="Name"          value={user.name} />
                            <ProfileFieldRow label="Email Address" value={user.email} />
                        </div>
                    )}
                </ProfileCard>

                <ProfilePasswordCard />

            </div>
        </AppLayout>
    );
};

export default Edit;
