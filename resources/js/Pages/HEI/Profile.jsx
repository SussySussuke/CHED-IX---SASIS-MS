import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import HEILayout from '../../Layouts/HEILayout';
import AddressSearchInput from '../../Components/Forms/AddressSearchInput';
import TextInput from '../../Components/Forms/TextInput';
import {
    ProfileCard,
    ProfilePageHeader,
    ProfileSuccessBanner,
    ProfileFieldRow,
    ProfileFormActions,
    ProfilePasswordCard,
} from '../../Components/Profile';

const Profile = ({ hei }) => {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        name:           hei.name           ?? '',
        email:          hei.email          ?? '',
        address:        hei.address        ?? '',
        established_at: hei.established_at ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/hei/profile', { onSuccess: () => setIsEditing(false) });
    };

    const handleCancel = () => { reset(); setIsEditing(false); };

    const formattedEstablished = hei.established_at
        ? new Date(hei.established_at).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'long', day: 'numeric',
          })
        : null;

    return (
        <HEILayout title="Institution Profile" showHeader={false}>
            <div className="max-w-3xl mx-auto space-y-6">

                <ProfilePageHeader
                    title="Institution Profile"
                    subtitle="Manage your institution's information"
                    isEditing={isEditing}
                    onEdit={() => setIsEditing(true)}
                />

                <ProfileSuccessBanner show={recentlySuccessful} />

                <ProfileCard
                    heading="Institution Identity"
                    footnote="UII, code, and type are managed by your CHED administrator."
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ProfileFieldRow label="UII"      value={hei.uii} />
                        <ProfileFieldRow label="HEI Code" value={hei.code} />
                        <ProfileFieldRow label="Type"     value={hei.type} />
                    </div>
                </ProfileCard>

                <ProfileCard heading="Institution Details">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <TextInput
                                label="Institution Name"
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Address
                                </label>
                                <AddressSearchInput
                                    value={data.address}
                                    onChange={(value) => setData('address', value)}
                                    error={errors.address}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date Established
                                </label>
                                <input
                                    type="date"
                                    value={data.established_at}
                                    onChange={(e) => setData('established_at', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                />
                                {errors.established_at && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.established_at}
                                    </p>
                                )}
                            </div>
                            <ProfileFormActions processing={processing} onCancel={handleCancel} />
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <ProfileFieldRow label="Institution Name" value={hei.name} />
                            <ProfileFieldRow label="Email Address"    value={hei.email} />
                            <ProfileFieldRow label="Address"          value={hei.address} />
                            <ProfileFieldRow label="Date Established" value={formattedEstablished} />
                        </div>
                    )}
                </ProfileCard>

                <ProfilePasswordCard />

            </div>
        </HEILayout>
    );
};

export default Profile;
