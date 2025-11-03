using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;

namespace GOG.API.Tests.TestHelpers
{
    public static class IdentityMocks
    {
        public static Mock<UserManager<TUser>> MockUserManager<TUser>() where TUser : class
        {
            var store = new Mock<TUserStore<TUser>>();
            var mgr = new Mock<UserManager<TUser>>(store.Object,
                Mock.Of<IOptions<IdentityOptions>>(),
                Mock.Of<IPasswordHasher<TUser>>(),
                Array.Empty<IUserValidator<TUser>(),
                Array.Empty<IPasswordValidator<TUser>(),
                Mock.Of<ILookupNormalizer>(),
                Mock.Of<IdentityErrorDescriber>(),
                Mock.Of<IServiceProvider>(),
                Mock.Of<ILogger<UserManager<TUser>>>());

            return mgr;
        }

        public static Mock<SignInManager<TUser>> MockSignInManager<TUser>(Mock<UserManager<TUser>> userManager) where TUser : class
        {
            var contextAccessor = new Mock<IHttpContextAccessor>();
            var claimsFactory = new Mock<TUserClaimPrincipalFactory<TUser>>();
            var schemes = Mock.Of<Microsoft.AspNetCore.Authentication.IAuthenticationSchemeProvider>();

            return new Mock<SignInManager<TUser>>(userManager.Object,
                contextAccessor.Object,
                claimsFactory.Object,
                Mock.Of<IOptions<IdentityOptions>>(),
                Mock.Of<ILogger<SignInManager<TUser>>>(),
                schemes);
        }
    }
}
